import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({
    query,
    setQuery,
    // setChatHistory,
    language,
    setLanguage,
    setIsGenerating,
    sendMessage
}) => {
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query || !query.trim()) return;

        setLoading(true);
        setIsGenerating(true);

        // setChatHistory(prev => [
        //     ...prev,
        //     { text: query, isUser: true }
        // ]);

        try {
            await sendMessage(query);
            setQuery(""); // Clear input
        } catch (error) {
            console.error("SearchBar send error:", error);
        } finally {
            setLoading(false);
            // Do NOT set isGenerating false here—App handles that when stream ends
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={query || ""}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                disabled={loading}
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? ". . ." : <i className="fas fa-paper-plane"></i>}
            </button>

            <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
            >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
            </select>
        </div>
    );
};

export default SearchBar;
