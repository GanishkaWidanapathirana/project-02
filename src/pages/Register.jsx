import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/mockAuth';
import './Register.css'; // Import the new CSS
import registerIllustration from '../assets/login-illustration.png'


export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const submit = async () => {
    const { name, email, age, password, confirmPassword } = form;

    if (!name || !email || !age || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('You must agree to the Terms of Service');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Note: We are sending the form data. Ensure your API handles the fields correctly.
      await registerApi({ name, email, age, password });
      nav('/login');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        
        {/* Left Side: Illustration (Same as login) */}
        <div className="register-illustration-wrapper">
          <img src={registerIllustration} alt="Register Illustration" className="register-illustration" />
        </div>

        {/* Right Side: Register Form */}
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">
            Join us and start your calm journey
          </p>

          {error && <p className="error-text">{error}</p>}

          {/* Full Name */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* User Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <input
                placeholder="Enter Your Full Name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          {/* Age */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* User Icon (reused for Age as per design) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <input
                type="number"
                placeholder="Enter Your Age"
                min="1"
                value={form.age}
                onChange={e => update('age', e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Mail Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </span>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Lock Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input
                type="password"
                placeholder="Enter Your Password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">
                {/* Lock Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                className="custom-input"
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="terms-container">
             <label className="terms-label">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={e => setAgreed(e.target.checked)} 
                />
                <span>I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong></span>
             </label>
          </div>

          <button
            className="register-btn"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>

          <p className="register-footer">
            Already have an account? <Link to="/login" className="login-link">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}