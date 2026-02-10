import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/mockAuth';
import { saveToken } from '../utils/auth';
import './Login.css'; 
import loginIllustration from '../assets/login-illustration.png'

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await loginApi({ email, password });
      saveToken(res.token);
      nav('/dashboard');
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side: Illustration */}
        <div className="login-illustration-wrapper">
          <img src={loginIllustration} alt="Login Illustration" className="login-illustration" />
        </div>

        {/* Right Side: Login Form */}
        <div className="login-card">
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Login to your account</p>

          {error && <p className="error-text">{error}</p>}

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Email Icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </span>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Lock Icon SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input
                type="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" class="forgot-link">Forgot Password?</Link>
          </div>

          <button
            className="login-btn"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>

          <p className="login-footer">
            Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link>
          </p>
        </div>

      </div>
    </div>
  );
}