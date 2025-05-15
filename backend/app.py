from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import time
import os
import re
import ast
import markdown
from openai import OpenAI
from dotenv import load_dotenv
import logging


# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Logging setup
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# SocketIO setup
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    max_http_buffer_size=1e8,
    always_connect=True,
    transports=['websocket', 'polling']
)

# OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
active_threads = {}

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('ask_question')
def handle_message(data):
    sid = request.sid
    user_input = data.get('question', '')
    session_id = data.get('session_id', 'new')
    language = data.get('language', 'en')

    language_prompt = f"{user_input}. Please answer the question in {language} language."
    logger.info(f"Prompt: {language_prompt}")

    def generate():
        try:
            # Get or create thread
            if session_id in active_threads:
                thread_id = active_threads[session_id]
            else:
                thread = client.beta.threads.create()
                thread_id = thread.id
                active_threads[session_id] = thread_id

            # Send user message
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=language_prompt
            )

            # Run assistant
            run = client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id="asst_Esyu2T2quwRAgOvkOmfIOcro"
            )

            # Wait for run to complete
            while run.status in ["queued", "in_progress"]:
                time.sleep(2)
                run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

            # Get final message
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            full_response = messages.data[0].content[0].text.value if messages.data else "Error: No response."

            # Extract follow-up questions
            response_text, follow_up_questions = extract_follow_up_questions(full_response)

            # Format the response as HTML
            formatted_response = format_text(response_text)

            # Stream the formatted response word-by-word
            for word in formatted_response.split():
                socketio.emit('stream_chunk', word + ' ', room=sid)
                time.sleep(0.05)

            # Emit follow-ups after streaming
            socketio.emit('stream_followups', {'followups': follow_up_questions}, room=sid)
            socketio.emit('stream_done', room=sid)

        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            socketio.emit('stream_error', {'error': str(e)}, room=sid)

    socketio.start_background_task(generate)

# REST endpoints
@app.route('/')
def home():
    return jsonify({"message": "Welcome to ChatVeda AI Backend!"})

def extract_follow_up_questions(full_response):
    follow_up_questions = []
    response_text = full_response

    pattern = r'(\"follow_up_questions\":\s*\[.*?\])'
    match = re.search(pattern, full_response, re.DOTALL)

    if match:
        try:
            question_section = match.group(1)
            extracted_dict = ast.literal_eval("{" + question_section + "}")
            follow_up_questions = extracted_dict.get("follow_up_questions", [])
            response_text = full_response[:match.start()].strip()
        except (SyntaxError, ValueError):
            pass

    return response_text, follow_up_questions

def format_text(response_text):
    html_output = markdown.markdown(response_text)
    text = re.sub(r"```[a-zA-Z]*", "", html_output)
    return text.strip()

@app.route('/get_answer_mock', methods=['POST'])
def get_mock_response():
    data = request.json
    user_question = data.get("question", "")
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    mock_response = {
        "response": f"<b>ChatVeda AI:</b> Mock response for your question: <i>{user_question}</i>.",
        "follow_up_questions": [
            "What are the benefits of Karma Yoga?",
            "Can Karma Yoga help in personal growth?",
            "How does Karma Yoga compare to Bhakti Yoga?"
        ],
        "session_id": "test_session"
    }
    return jsonify(mock_response)

@app.route('/api/get_answer', methods=['POST', 'OPTIONS'])
def ask_question():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.json
    user_question = data.get("question", "")
    session_id = data.get("session_id", "new")
    language = data.get("language", "en")

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    language_prompt = f"{user_question} Please translate in {language}"

    if session_id in active_threads:
        thread_id = active_threads[session_id]
    else:
        thread = client.beta.threads.create()
        thread_id = thread.id
        active_threads[session_id] = thread_id

    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=language_prompt
    )

    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id="asst_Esyu2T2quwRAgOvkOmfIOcro"
    )

    while run.status in ["queued", "in_progress"]:
        time.sleep(2)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

    messages = client.beta.threads.messages.list(thread_id=thread_id)
    full_response = messages.data[0].content[0].text.value if messages.data else "Error: Assistant did not return a response."

    response_text, follow_up_questions = extract_follow_up_questions(full_response)
    formatted_response = format_text(response_text)

    return jsonify({
        "response": formatted_response,
        "follow_up_questions": follow_up_questions,
        "session_id": session_id
    })

@app.route('/update_instructions', methods=['POST'])
def update_instructions():
    data = request.json
    new_instructions = data.get("instructions", "")
    if not new_instructions:
        return jsonify({"error": "No new instructions provided"}), 400

    try:
        updated_assistant = client.beta.assistants.update(
            assistant_id="asst_Esyu2T2quwRAgOvkOmfIOcro",
            instructions=new_instructions
        )
        return jsonify({"message": "Instructions updated", "assistant_id": updated_assistant.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_files', methods=['POST'])
def add_files():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    file_ids = []
    for file in files:
        uploaded_file = client.files.create(file=file, purpose="assistants")
        file_ids.append(uploaded_file.id)

    updated_vector_store = client.beta.vector_stores.update(
        vector_store_id="vs_67b0a3af426c81919b944df29f27d7c2",
        file_ids=file_ids
    )

    return jsonify({
        "message": "Files added",
        "vector_store_id": updated_vector_store.id
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"Server running on port {port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)
