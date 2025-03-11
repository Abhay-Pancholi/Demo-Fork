import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ChatContainer from './components/ChatContainer';
import './assets/styles.css';    // Your global styles
import './assets/panel.css';     // Your sidebar panel styles

function App() {
    const [query, setQuery] = useState("");
    const [chatHistory, setChatHistory] = useState([]);   // Stores the conversation
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar open/close
    const [showWelcome, setShowWelcome] = useState(true); // Controls welcome message
    const [language, setLanguage] = useState("en");       // Track language selection
    const [isGenerating, setIsGenerating] = useState(false); // Track API loading state

    // Hide welcome message once we have any chat messages
    useEffect(() => {
        if (chatHistory.length > 0) {
            setShowWelcome(false);
        }
    }, [chatHistory]);

    /**
     * sendMessage: Appends a user message to chatHistory, then calls the server
     * for a response and appends the response to chatHistory as well.
     */
    const sendMessage = async (messageText) => {
        // Prevent sending if we are already waiting on a response
        if (isGenerating) {
            console.log("A request is already in progress. Please wait.");
            return;
        }

        // 1) Append user message to chat history
        setChatHistory((prev) => [
            ...prev,
            { isUser: true, text: messageText }
        ]);

        // 2) Indicate we are waiting for a response
        setIsGenerating(true);

        try {
            // 3) Fetch the actual response from your server endpoint
            const response = await fetch("https://chatveda.onrender.com/get_answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: messageText,
                    language: language
                })
            });

            const data = await response.json();

            // 4) Append the server's response to chat history
            setChatHistory((prev) => [
                ...prev,
                {
                    isUser: false,
                    text: data.response,
                    followUpQuestions: data.follow_up_questions || []
                }
            ]);
        } catch (error) {
            console.error("Error fetching response:", error);
            // Optionally display the error in the chat
            setChatHistory((prev) => [
                ...prev,
                { isUser: false, text: `Error: ${error.message}` }
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Close the sidebar if the user clicks outside it
    const handleContentClick = () => {
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Navbar: passes onSearch, which calls sendMessage */}
            <Navbar onSearch={(q) => sendMessage(q)} isSidebarOpen={isSidebarOpen} />

            {/* Sidebar: calls sendMessage when a question is clicked */}
            <Sidebar
                sendMessage={sendMessage}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Show welcome message if no chat yet */}
            {showWelcome && (
                <div className="welcome-message">
                    <h2>
                        ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय। ॐ शान्तिः शान्तिः शान्तिः ॥
                        <span role="img" aria-label="smile">🙏</span>
                    </h2>
                    <h3 className="sanskrit-text">
                        <i>- Om, Lead me from the unreal to the real,</i>
                    </h3>
                    <h3><i>Lead me from darkness to light,</i></h3>
                    <h3><i>Lead me from death to immortality.</i></h3>
                    <h3><i>May peace be, may peace be, may peace be.</i></h3>
                </div>
            )}

            {/* Main content area (SearchBar + ChatContainer) */}
            <div className="main-content" onClick={handleContentClick}>
                <SearchBar
                    query={query}
                    setQuery={setQuery}
                    setChatHistory={setChatHistory}
                    language={language}
                    setLanguage={setLanguage}
                    setIsGenerating={setIsGenerating}
                />

                <ChatContainer
                    chatHistory={chatHistory}
                    isGenerating={isGenerating}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    );
}

export default App;
