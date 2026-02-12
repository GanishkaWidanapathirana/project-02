import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
// ⚠️ IMPORTANT: Save the girl in green circle image as 'meditation-green.png' 
// in your assets folder.
import meditationGreen from '../assets/meditation-green.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Symmetry Detection',
      path: '/symmetry'
    },
    {
      title: 'Checking & Rechecking',
      path: '/checking'
    },
    {
      title: 'Contamination Check',
      path: '/cleaning'
    },
    {
      title: 'Intrusive Thoughts & Cognitive Interpretation',
      path: '/intrusive-thoughts'
    }
  ];

  return (
    <div className="dashboard-page">
      
      {/* Top Left Home Icon */}
      <button className="home-icon-btn" onClick={() => navigate('/game-dashboard')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>

      {/* Main Content */}
      <div className="dashboard-content">
        
        {/* Hero Image */}
        <div className="hero-image-container">
          <img 
            src={meditationGreen} 
            alt="Meditation Illustration" 
            className="hero-img" 
          />
        </div>

        {/* Menu Buttons */}
        <div className="menu-list">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              className="menu-btn"
              onClick={() => navigate(item.path)}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Bottom Exit Button */}
        <button className="exit-btn" onClick={() => navigate('/welcome')}>
          Exit
        </button>

      </div>
    </div>
  );
};

export default Dashboard;