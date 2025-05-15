import React, { useState, useEffect, useRef } from 'react';
import { sendQuestion, socket } from "./utlis/socketClient";
import { FiMenu } from 'react-icons/fi';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ChatContainer from './components/ChatContainer';
import './assets/styles.css';
import './assets/panel.css';

function App() {
    const [query, setQuery] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [language, setLanguage] = useState("en");
    const [isGenerating, setIsGenerating] = useState(false);
    const [buffer, setBuffer] = useState(""); // Buffer for incoming chunks
    const [displayedText, setDisplayedText] = useState(""); // For typewriter effect
    const intervalRef = useRef(null);

    useEffect(() => {
        if (chatHistory.length > 0) {
            setShowWelcome(false);
        }
    }, [chatHistory]);

    // Listen for streaming chunks and buffer them

    // Typewriter effect: move one character at a time from buffer to displayedText
    useEffect(() => {
        if (isGenerating && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setBuffer((prevBuffer) => {
                    if (prevBuffer.length > 0) {
                        setDisplayedText((prevText) => prevText + prevBuffer[0]);
                        return prevBuffer.slice(1);
                    } else {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        return prevBuffer;
                    }
                });
            }, 18);
        }
        if (!isGenerating) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [isGenerating, buffer]);

    // When streaming ends, update chatHistory with the full displayedText
   useEffect(() => {
    if (!isGenerating && displayedText) {
        setChatHistory((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && !last.isUser) {
                last.text = displayedText;
            }
            return updated;
        });
        setDisplayedText("");
    }
}, [isGenerating]);


    // Reset displayedText and buffer when a new message is sent
    const sendMessage = async (messageText) => {
        setChatHistory((prev) => [
            ...prev,
            { isUser: true, text: messageText },
            { isUser: false, text: '', isAnalyzing: true }
        ]);
        setTimeout(() => {
            if (window && document) {
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
        let firstChunk = true;
        try {
            await sendQuestion({
                question: messageText,
                sessionId: "test",
                language: language,
                onStream: (chunk) => {
                    setChatHistory((prev) => {
                        const updated = [...prev];
                        for (let i = updated.length - 1; i >= 0; i--) {
                            if (!updated[i].isUser && (updated[i].isAnalyzing || updated[i].text !== undefined)) {
                                if (updated[i].isAnalyzing) {
                                    updated[i].isAnalyzing = false;
                                }
                                if (typeof chunk === 'object' && chunk.type === 'followups') {
                                    updated[i].followUpQuestions = chunk.followups;
                                } else {
                                    updated[i].text += chunk;
                                }
                                break;
                            }
                        }
                        return updated;
                    });
                    setTimeout(() => {
                        if (window && document) {
                            const chatContainer = document.querySelector('.chat-container');
                            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    }, 50);
                },
                onDone: () => {
                    setChatHistory((prev) => {
                        const updated = [...prev];
                        for (let i = updated.length - 1; i >= 0; i--) {
                            if (!updated[i].isUser && !updated[i].isAnalyzing) {
                                // Optionally mark as done
                                break;
                            }
                        }
                        return updated;
                    });
                },
                onError: (err) => {
                    setChatHistory((prev) => [
                        ...prev,
                        { isUser: false, text: `⚠️ Error: ${err.error || err}` }
                    ]);
                }
            });
        } catch (error) {
            setChatHistory((prev) => [
                ...prev,
                { isUser: false, text: "⚠️ Error sending message. Please try again." }
            ]);
        }
    };

    const handleContentClick = () => {
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Hamburger icon always visible at the very top left when sidebar is closed */}
            {!isSidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 98,
                        left: 8,
                        zIndex: 3000,
                        background: '#fff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(26,35,126,0.08)',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '1px solid #e3e8ee'
                    }}
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <FiMenu size={22} color='#1a237e' />
                </div>
            )}
            <Navbar onSearch={(q) => sendMessage(q)} isSidebarOpen={isSidebarOpen} />
            <Sidebar
                sendMessage={sendMessage}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {showWelcome && (
                <div className="welcome-message">
                    <h2>
                        ॐ असतो मा सद्गमय। तमसो मा ज्योतिर्गमय। मृत्योर्मा अमृतं गमय। ॐ शान्तिः शान्तिः शान्तिः ॥🙏
                    </h2>
                    <h3 className="sanskrit-text"><i>- Om, Lead me from the unreal to the real,</i></h3>
                    <h3><i>Lead me from darkness to light,</i></h3>
                    <h3><i>Lead me from death to immortality.</i></h3>
                    <h3><i>May peace be, may peace be, may peace be.</i></h3>
                </div>
            )}

            <div className="main-content" onClick={handleContentClick}>
                <SearchBar
                    query={query}
                    setQuery={setQuery}
                    setChatHistory={setChatHistory}
                    language={language}
                    setLanguage={setLanguage}
                    setIsGenerating={setIsGenerating}
                    sendMessage={sendMessage}
                />
                <ChatContainer
                    chatHistory={chatHistory}
                    isGenerating={isGenerating}
                    sendMessage={sendMessage}
                    displayedText={displayedText}
                />
                <p className="alert"><i>ChatVeda can make mistakes. Model is under training.</i></p>
            </div>
        </div>
    );
}

export default App;
