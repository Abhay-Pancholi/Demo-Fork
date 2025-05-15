import React, { useEffect, useRef } from "react";
import "./ChatContainer.css"; // Import your styles

const ChatContainer = ({ chatHistory, isGenerating, sendMessage, displayedText }) => {
    const chatContainerRef = useRef(null);

    // Auto-scroll to the bottom when chat history, isGenerating, or displayedText changes.
    useEffect(() => {
        if (chatContainerRef.current) {
            setTimeout(() => {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }, 100);
        }
    }, [chatHistory, isGenerating, displayedText]);

    // If no messages and not generating, do not render the chat container.
    if ((!chatHistory || chatHistory.length === 0) && !isGenerating) return null;

    return (
        <div className="chat-container" ref={chatContainerRef}>
            {chatHistory.map((chat, index) => (
                <div key={index} className={`chat-message ${chat.isUser ? "user" : "bot"}`}>
                    <p className="message-sender">{chat.isUser ? "Seeker" : "ChatVeda"}</p>
                    <div className={`message-bubble${chat.isAnalyzing ? ' analyzing-bubble' : ''}`}
                        dangerouslySetInnerHTML={{
                            __html:
                                chat.isUser
                                    ? chat.text
                                    : chat.isAnalyzing
                                        ? '<span class="analyzing-text">Generating response, please wait…</span> <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>'
                                        : chat.text
                        }}
                    />
                    {/* Render follow-up questions (if any) */}
                    {!chat.isUser && chat.followUpQuestions?.length > 0 && (
                        <div className="followup-questions">
                            <div className="followup-heading"><b></b></div>
                            {chat.followUpQuestions.map((q, i) => (
                                <div
                                    key={i}
                                    className="followup-row"
                                    onClick={() => sendMessage(q)}
                                    tabIndex={0}
                                    role="button"
                                    style={{ outline: 'none' }}
                                >
                                    <span className="followup-arrow"></span> <span className="followup-text">{q}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ChatContainer;
