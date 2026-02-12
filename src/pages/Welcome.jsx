import { useNavigate } from 'react-router-dom';
import './Welcome.css'; 
import homeIllustration from '../assets/home-illustration.png'

export default function Welcome() {
  const nav = useNavigate();

  const handleStart = () => {
    // Navigate to your actual game dashboard or the questionnaire
    nav('/game-dashboard'); 
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        
        {/* LEFT COLUMN: Hello & Image */}
        <div className="welcome-left">
          <h1 className="hello-title">Hello!</h1>
          <div className="illustration-wrapper">
            <img 
              src={homeIllustration} 
              alt="Thinking Illustration" 
              className="welcome-img" 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Welcome Text & Action Card */}
        <div className="welcome-right">
          <h2 className="greeting-title">Welcome,</h2>
          
          <div className="intro-text-block">
            <p className="main-desc">
              There are no right or wrong answers - just your experience.
            </p>
            <ul className="tips-list">
              <li>Take your time.</li>
            </ul>
          </div>

          {/* Mint Green Card */}
          <div className="welcome-card">
            <h3 className="card-heading">Let's understand your OCD symptoms</h3>
            <p className="card-text">
              Your experiences matter - share only what feels comfortable to you.
            </p>
            
            <button className="get-started-btn" onClick={handleStart}>
              Get Started <span className="btn-arrow">&rsaquo;</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}