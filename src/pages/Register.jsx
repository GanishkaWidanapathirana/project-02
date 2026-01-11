import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/mockAuth';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const submit = async () => {
    const { name, email, age, gender, password } = form;

    if (!name || !email || !age || !gender || !password) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await registerApi(form);
      nav('/login');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-root">
      <div className="landing-glass auth-card">
        <span className="landing-pill">🧩 Join the Lab</span>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Start exploring cognitive games and simulations
        </p>

        {error && <p className="error-text">{error}</p>}

        <div className="auth-field">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={e => update('name', e.target.value)}
          />
        </div>

        <div className="auth-field">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
          />
        </div>

        <div className="auth-field">
          <input
            type="number"
            placeholder="Age"
            min="1"
            value={form.age}
            onChange={e => update('age', e.target.value)}
          />
        </div>

        <div className="auth-field">
          <select
            value={form.gender}
            onChange={e => update('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_say">Prefer not to say</option>
          </select>
        </div>

        <div className="auth-field">
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => update('password', e.target.value)}
          />
        </div>

        <button
          className="btn-primary auth-btn"
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
