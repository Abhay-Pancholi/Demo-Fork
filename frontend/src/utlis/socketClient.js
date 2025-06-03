import { io } from "socket.io-client";

// Establish WebSocket connection
const socket = io("wss://backend-service-654291006122.us-central1.run.app", {
  transports: ['polling', 'websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Function to clear previous listeners
function clearListeners() {
  socket.off("stream_chunk");
  socket.off("stream_done");
  socket.off("stream_error");
}

// Function to send a question to the backend (triggering the stream)
export function sendQuestion({ question, sessionId, language = "en", onStream, onDone, onError }) {
  clearListeners();

  socket.emit("ask_question", {
    question,             // use 'question' to match backend
    session_id: sessionId,
    language
  });
  

  // Listen for the streamed chunks and update the UI
  socket.on("stream_chunk", (chunk) => {
    // console.log("socketClient.js received chunk:", chunk); // Debug log
    if (onStream) onStream(chunk);
  });
  
  // Listen for follow-up questions
  socket.on("stream_followups", (data) => {
    // console.log("socketClient.js received followups:", data); // Debug log
    if (onStream) onStream({ type: 'followups', followups: data.followups });
  });

  // Handle when streaming is done
  socket.on("stream_done", (data) => {
    if (onDone) onDone(data);
  });

  // Handle errors during the streaming
  socket.on("stream_error", (err) => {
    if (onError) onError(err.error || err);
  });
}

export { socket };
