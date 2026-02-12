import { useNavigate } from 'react-router-dom';
import './GameDashboard.css';
import logoImage from '../assets/logo.png'; 
import mindMatchImage from '../assets/mind-match.png';
import meditationImage from '../assets/meditation.png';

export default function GameDashboard() {
  const nav = useNavigate();

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
          <div className="profile-icon">
            {/* Simple User Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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