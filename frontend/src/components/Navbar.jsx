import React, { useState } from 'react';

const Navbar = ({ onSearch }) => {
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const handleItemClick = (text) => {
        if (onSearch) {
            onSearch(text); 
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
               <div className='logo'> <img src="/logocropped.jpg" alt="ChatVeda AI Logo" className="logo" /></div>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <button className="nav-button" onClick={() => toggleDropdown('education')}>
                            Education
                        </button>
                        {openDropdown === 'education' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('History of Education')}>History of Education</button></li>
                                <li><button onClick={() => handleItemClick('Modern Education System')}>Modern Education System</button></li>
                                <li><button onClick={() => handleItemClick('Vedic Education')}>Vedic Education</button></li>
                            </ul>
                        )}
                    </li>
                    <li className="nav-item">
                        <button className="nav-button" onClick={() => toggleDropdown('religious')}>
                            Religious
                        </button>
                        {openDropdown === 'religious' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('Hinduism')}>Hinduism</button></li>
                                <li><button onClick={() => handleItemClick('Buddhism')}>Buddhism</button></li>
                            </ul>
                        )}
                    </li>
                    <li className="nav-item">
                        <button className="nav-button" onClick={() => toggleDropdown('history')}>
                            History
                        </button>
                        {openDropdown === 'history' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('Ancient History')}>Ancient History</button></li>
                                <li><button onClick={() => handleItemClick('Medieval History')}>Medieval History</button></li>
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
