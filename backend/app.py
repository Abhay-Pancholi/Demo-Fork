from flask import Flask, request, jsonify, render_template
import time
import os
import re
import ast
from openai import OpenAI
import markdown
from flask_cors import CORS  # Allows cross-origin requests from React

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# OpenAI API key
# os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



@app.route('/')
def home():
    return jsonify({"message": "Welcome to ChatVeda AI Backend!"})




def extract_follow_up_questions(full_response):
    """
    Extracts follow-up questions from the response text when formatted as a Python list.
    Returns a tuple: (formatted response without questions, list of extracted questions).
    """
    follow_up_questions = []
    response_text = full_response  

    # Regular expression pattern to detect Python list format
    pattern = r'(\"follow_up_questions\":\s*\[.*?\])'

    match = re.search(pattern, full_response, re.DOTALL)
    
    if match:
        question_section = match.group(1)  # Extract the full Python list string
        try:
            # Convert the extracted Python list string to an actual list using ast.literal_eval
            extracted_dict = ast.literal_eval("{" + question_section + "}")  # Convert to dictionary
            follow_up_questions = extracted_dict.get("follow_up_questions", [])  # Extract list
            print(follow_up_questions)
        except (SyntaxError, ValueError):
            follow_up_questions = []  # If there's an error, return an empty list

        # Remove the follow-up question section from the response text
        response_text = full_response[:match.start()].strip()

    return response_text, follow_up_questions



# function for formatting api response
def format_text(response_text):
    """
    Converts ChatVeda markdown-styled output into HTML for frontend rendering.
    
    :param text: The ChatVeda output with markdown-style formatting.
    :return: HTML formatted string ready for frontend rendering.
    """
    # Convert markdown to HTML
    html_output = markdown.markdown(response_text)

    """ Remove unwanted markdown or formatting from the response """
    text = re.sub(r"```[a-zA-Z]*", "", html_output)  # Remove markdown-style code block indicators
    text = text.strip()  # Remove leading/trailing spaces
    return text

@app.route('/get_answer_mock', methods=['POST'])
def get_mock_response():
    """Returns a dummy response for UI testing."""
    data = request.json
    user_question = data.get("question", "")

    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    # Mock response (simulating OpenAI Assistant's formatted response)
    mock_response = {
        "response": f"<b>ChatVeda AI:</b> This is a mock response for your question This is a mock response for your questionThis is a mock response for your questionThis is a mock response for your question: <i>{user_question}</i>.",
        "follow_up_questions": [
            "What are the benefits of Karma Yoga?",
            "Can Karma Yoga help in personal growth?",
            "How does Karma Yoga compare to Bhakti Yoga?"
        ],
        "session_id": "test_session"
    }

    return jsonify(mock_response)


# Store ongoing conversations (thread tracking)
active_threads = {}

@app.route('/get_answer', methods=['POST'])
def ask_question():
    """Handles user queries and returns an AI response."""
    data = request.json
    user_question = data.get("question", "")
    session_id = data.get("session_id", "new")
    language = data.get("language", "en")
    if not user_question:
        return jsonify({"error": "No question provided"}), 400

    language_prompt = f"{user_question} Please translate in {language}"
    # Use an existing thread if session_id is provided, else create a new thread
    if session_id in active_threads:
        thread_id = active_threads[session_id]
    else:
        thread = client.beta.threads.create()
        thread_id = thread.id
        active_threads[session_id] = thread_id  

    # Add user message to the thread
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=language_prompt
    )

    # Run the assistant
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id="asst_Esyu2T2quwRAgOvkOmfIOcro"
    )

    # Wait for completion
    while run.status in ["queued", "in_progress"]:
        time.sleep(2)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        print(f"Run Status: {run.status}")  

    # Retrieve assistant response
    messages = client.beta.threads.messages.list(thread_id=thread_id)

    if messages.data:
        full_response = messages.data[0].content[0].text.value
    else:
        full_response = "Error: Assistant did not return a response."

    print("Raw Assistant Response:", full_response)  

    # Extract follow-up questions properly
    response_text, follow_up_questions = extract_follow_up_questions(full_response)

    # Apply formatting to response
    formatted_response = format_text(response_text)

    return jsonify({"response": formatted_response, "follow_up_questions": follow_up_questions, "session_id": session_id})


@app.route('/update_instructions', methods=['POST'])
def update_instructions():
    """Updates the assistant's instructions dynamically."""
    data = request.json
    new_instructions = data.get("instructions", "")

    if not new_instructions:
        return jsonify({"error": "No new instructions provided"}), 400

    try:
        updated_assistant = client.beta.assistants.update(
            assistant_id="asst_Esyu2T2quwRAgOvkOmfIOcro",
            instructions=new_instructions
        )
        return jsonify({"message": "Instructions updated successfully", "assistant_id": updated_assistant.id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_files', methods=['POST'])
def add_files():
    """Adds new files to the assistant's vector store."""
    files = request.files.getlist("files")  # Accept multiple files

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    file_ids = []
    for file in files:
        uploaded_file = client.files.create(file=file, purpose="assistants")
        file_ids.append(uploaded_file.id)

    # Update vector store
    updated_vector_store = client.beta.vector_stores.update(
        vector_store_id="vs_67b0a3af426c81919b944df29f27d7c2",
        file_ids=file_ids  # Add new file IDs to the existing vector store
    )

    return jsonify({"message": "Files added successfully", "vector_store_id": updated_vector_store.id})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)

