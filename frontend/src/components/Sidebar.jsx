import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

const Sidebar = ({ sendMessage, isOpen, setIsOpen }) => {
    const questions = [
        "What are the four Vedas?",
        "Dharma, Karma and Moksha?",
        "What are the stages of life?",
        "How many Puranas?",
        "Concept and types of Vimanas?",
        "Types of Weapons in Atharvaved?",
        "Astrology and its key concepts?",
        "Metallurgy as per Vedas?",
        "Astronomy as per Vedas?",
        "Dharma in Puranas?",
        "Concept of 'Shunya' or Zero?",
        "Rituals and its significance?",
        "Geometrical concepts in Vedas?",
        "Puranas and kingship?"
    ];

    // When a question is clicked, call sendMessage to directly trigger search.
    const handleQuestionClick = (question) => {
        sendMessage(question);
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger icon only when sidebar is closed */}
            {!isOpen && (
                <div
                    className="toggle-button"
                    onClick={() => setIsOpen(true)}
                    style={{ position: 'fixed', top: 98, left: 8, zIndex: 3000 }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </div>
            )}
            {/* Sidebar only when open */}
            {isOpen && (
                <div className={`side-panel aesthetic-panel open`}>
                    {/* Top bar with title and close icon */}
                    <div className="sidebar-topbar">
                        <span className="sidebar-title">ChatVeda AI</span>
                        <span className="sidebar-close-icon" onClick={() => setIsOpen(false)}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </span>
                    </div>
                    {/* Scrollable question list */}
                    <ul className="conversation-list scrollable-questions">
                        {questions.map((question, index) => (
                            <li 
                                key={index} 
                                onClick={() => handleQuestionClick(question)}
                                className="clickable-item question-card"
                            >
                                {question}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default Sidebar;
