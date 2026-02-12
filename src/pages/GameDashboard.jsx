import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameDashboard.css';
import logoImage from '../assets/logo.png'; 
import mindMatchImage from '../assets/mind-match.png';
import meditationImage from '../assets/meditation.png';
import { logout } from '../utils/auth'

export default function GameDashboard() {
  const nav = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = () => {
    logout(); // Clears tokens/user data from localStorage
    nav('/login'); // Redirects to login page
  };

  return (
    <div className="game-dashboard-page">
      
      {/* --- HEADER --- */}
      <header className="dashboard-header">
        
        <div className="header-left">
          <img src={logoImage} alt="TheraOCD Logo" className="header-logo" />
          <span className="logo-text">TheraOCD</span>
        </div>

        <div className="header-right">
          <button className="nav-pill active">Dashboard</button>
          <button className="nav-pill">Support</button>

          <div className="profile-container">
            <div
              className="profile-icon"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            {showDropdown && (
              <div className="profile-dropdown">
                <button className="dropdown-item" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="cards-container">
        
        {/* CARD 1: Mind Matching */}
        <div className="game-card">
          <h2 className="card-title">Mind Matching</h2>
          <p className="card-subtitle">A fun game to challenge OCD</p>
          
          <div className="card-image-wrapper">
            <img src={mindMatchImage} alt="Mind Matching" className="card-img" />
          </div>

          <p className="card-tagline">Small challenges, big progress</p>
          
          <button className="play-btn" onClick={() => nav('/dashboard')}>
            Start Game
          </button>
        </div>

        {/* CARD 2: Mindfulness */}
        <div className="game-card">
          <h2 className="card-title">Mindfulness</h2>
          <p className="card-subtitle">Calm your mind with guided exercises</p>
          
          <div className="card-image-wrapper">
            <img src={meditationImage} alt="Meditation" className="card-img" />
          </div>

          <p className="card-tagline blue-text">Deep Breathing</p>
          <p className="card-desc">Breathe in calm, breathe out stress</p>
          
          <button className="play-btn" onClick={() => nav('/mindfulness')}>
            Play
          </button>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="dashboard-footer">
        <span className="trophy-icon">🏆</span>
        <span className="footer-text">Remember, every small step is progress!</span>
      </footer>

    </div>
  );
}