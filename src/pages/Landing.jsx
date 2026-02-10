import { Link } from 'react-router-dom';
import './Landing.css'; // Make sure to import the CSS file
import logoImage from '../assets/logo.png';

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-content">
        
        {/* Logo Section */}
        <div className="logo-container">
            <img src={logoImage} alt="TheraOCD Logo" className="landing-logo" />
        </div>

        {/* Text Section */}
        <h1 className="landing-title">
          TheraOCD
        </h1>

        <p className="landing-subtitle">
          A calm space for your mind
        </p>

        {/* Buttons Section */}
        <div className="landing-buttons">
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>

          <Link to="/register" className="btn btn-primary">
            Sign Up
          </Link>
        </div>

        {/* Footer Section */}
        <div className="landing-footer">
          <Link to="/register" className="footer-link">
             New here? Create an account seconds.
          </Link>
        </div>

      </div>
    </div>
  );
}