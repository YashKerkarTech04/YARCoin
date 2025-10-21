import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ onLogout }) {
  const [achDropdownOpen, setAchDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAchDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    if (onLogout) onLogout();
  };

  const toggleDropdown = () => {
    setAchDropdownOpen(!achDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setAchDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">YARCoin</div>
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-desktop">
        <ul className="navbar-links">
          <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>

          {/* My Achievements with dropdown */}
          <li 
            className="dropdown"
            ref={dropdownRef}
            onMouseEnter={() => setAchDropdownOpen(true)}
            onMouseLeave={() => setAchDropdownOpen(false)}
          >
            <Link to="#" onClick={toggleDropdown} className="dropdown-toggle">
              Achievements <span className="dropdown-arrow"></span>
            </Link>
            <ul className={`dropdown-menu ${achDropdownOpen ? 'active' : ''}`}>
              <li><Link to="/achievements/pending" onClick={closeMobileMenu}>Pending</Link></li>
              <li><Link to="/achievements/declined" onClick={closeMobileMenu}>Declined</Link></li>
              {/* <li><Link to="/achievements/revision_requested" onClick={closeMobileMenu}>Revision</Link></li> */}
              <li><Link to="/achievements/approved" onClick={closeMobileMenu}>Approved</Link></li>
            </ul>
          </li>

          <li><Link to="/profile" onClick={closeMobileMenu}>Profile</Link></li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`navbar-mobile ${mobileMenuOpen ? 'active' : ''}`}
        ref={mobileMenuRef}
      >
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
        <div className="mobile-menu-content">
          <ul className="mobile-links">
            <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
            
            <li className="mobile-dropdown">
              <button 
                className="mobile-dropdown-toggle"
                onClick={() => setAchDropdownOpen(!achDropdownOpen)}
              >Achievements <span className={`dropdown-arrow ${achDropdownOpen ? 'open' : ''}`}></span>
              </button>
              <ul className={`mobile-dropdown-menu ${achDropdownOpen ? 'active' : ''}`}>
                <li><Link to="/achievements/pending" onClick={closeMobileMenu}>Pending </Link></li>
                <li><Link to="/achievements/declined" onClick={closeMobileMenu}>Declined </Link></li>
                <li><Link to="/achievements/revision_requested" onClick={closeMobileMenu}>Revision </Link></li>
                <li><Link to="/achievements/approved" onClick={closeMobileMenu}>Approved </Link></li>
              </ul>
            </li>

            <li><Link to="/profile" onClick={closeMobileMenu}>Profile</Link></li>
            <li>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}