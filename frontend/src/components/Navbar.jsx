import React, { useState, useEffect, useRef } from 'react';

const Navbar = ({ onSearch }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        }

        if (isMobile) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isMobile]);

    // ✅ Handle clicking on a topic → Directly send query
    const handleItemClick = (query) => {
        if (typeof onSearch === "function") {  // ✅ Ensure it's a function
            onSearch(query);
        } else {
            console.error("onSearch is not defined or not a function!");
        }
        if (isMobile) {
            setOpenDropdown(null); // Close dropdown on mobile
        }
    };

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    return (
        <nav className="navbar" ref={navRef}>
            <div className="navbar-container">
                <div className='logo'>
                    <img src="/logocropped.jpg" alt="ChatVeda AI Logo" className="logo" />
                </div>
                <ul className="nav-menu">
                    {/* Education Dropdown */}
                    <li 
                        className="nav-item"
                        onMouseEnter={!isMobile ? () => setOpenDropdown('education') : null}
                        onMouseLeave={!isMobile ? () => setOpenDropdown(null) : null}
                    >
                        <button className="nav-button" onClick={isMobile ? () => toggleDropdown('education') : null}>
                            Education
                        </button>
                        {openDropdown === 'education' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('Atharveda')}>Atharveda</button></li>
                                <li><button onClick={() => handleItemClick('Samveda')}>Samveda</button></li>
                                <li><button onClick={() => handleItemClick('Yajurveda')}>Yajurveda</button></li>
                                <li><button onClick={() => handleItemClick('Rigveda')}>Rigveda</button></li>
                                <li><button onClick={() => handleItemClick('Shivpuran')}>Shivpuran</button></li>
                                <li><button onClick={() => handleItemClick('Agnipuran')}>Agnipuran</button></li>
                                <li><button onClick={() => handleItemClick('Garudpuran')}>Garudpuran</button></li>
                                <li><button onClick={() => handleItemClick('Brahmapuran')}>Brahmapuran</button></li>
                                <li><button onClick={() => handleItemClick('Bhagvat Puran')}>Bhagvat Puran</button></li>
                            </ul>
                        )}
                    </li>

                    {/* Religious Dropdown */}
                    <li 
                        className="nav-item"
                        onMouseEnter={!isMobile ? () => setOpenDropdown('religious') : null}
                        onMouseLeave={!isMobile ? () => setOpenDropdown(null) : null}
                    >
                        <button className="nav-button" onClick={isMobile ? () => toggleDropdown('religious') : null}>
                            Religious
                        </button>
                        {openDropdown === 'religious' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('Bhagvad Gita')}>Bhagvad Gita</button></li>
                                <li><button onClick={() => handleItemClick('Ram charit Manas')}>Ram charit Manas</button></li>
                            </ul>
                        )}
                    </li>

                    {/* History Dropdown */}
                    <li 
                        className="nav-item"
                        onMouseEnter={!isMobile ? () => setOpenDropdown('history') : null}
                        onMouseLeave={!isMobile ? () => setOpenDropdown(null) : null}
                    >
                        <button className="nav-button" onClick={isMobile ? () => toggleDropdown('history') : null}>
                            History
                        </button>
                        {openDropdown === 'history' && (
                            <ul className="dropdown">
                                <li><button onClick={() => handleItemClick('Ramayana')}>Ramayana</button></li>
                                <li><button onClick={() => handleItemClick('Mahabharta')}>Mahabharta</button></li>
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
