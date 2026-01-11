import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/mockAuth';
import { saveToken } from '../utils/auth';

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
    <div className="landing-root">
      <div className="landing-glass auth-card">
        <span className="landing-pill">🔐 Welcome Back</span>

        <h2 className="auth-title">Login</h2>
        <p className="auth-subtitle">
          Sign in to continue your cognitive journey
        </p>

        {error && <p className="error-text">{error}</p>}

        <div className="auth-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn-primary auth-btn"
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
