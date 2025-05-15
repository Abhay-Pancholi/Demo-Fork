import React from "react";
import "./ChatContainer.css";

const TypingIndicator = ({ message = "Analyzing your question, please wait..." }) => (
  <div className="typing-indicator">
    <span>{message}</span>
    <span className="typing-dots">
      <span>.</span><span>.</span><span>.</span>
    </span>
  </div>
);

export default TypingIndicator; 