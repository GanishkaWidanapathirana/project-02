import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-glass">
        <span className="landing-pill">🧠 Cognitive Lab</span>

        <h1 className="landing-title">
          Train Your Mind
        </h1>

        <p className="landing-text">
          Play science-backed cognitive games and explore how perception,
          attention, and decision-making work.
        </p>

        <div className="landing-buttons">
          <Link to="/login" className="btn-primary">
            Login
          </Link>

          <Link to="/register" className="btn-secondary">
            Create Account
          </Link>
        </div>

        <div className="landing-meta">
          Secure • Lightweight • Research-grade
        </div>
      </div>
    </div>
  );
}
