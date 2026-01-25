import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import SymmetryGame from './pages/SymmetryGame';
import CleaningGame from './pages/CleaningGame';
import './index.css';
import CheckingGame from './pages/CheckingGame';
import IntrusiveThoughtsGame from './pages/IntrusiveThoughtsGame';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

/* ---------------- PWA Install Button ---------------- */
const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        padding: '8px 14px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      ⬇ Install App
    </button>
  );
};

/* ---------------- Layout ---------------- */
const GameLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="layout-container">
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div
          style={{
            maxWidth: '1150px',
            margin: '0 auto 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {!isDashboard && (
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                color: 'var(--text-soft)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ← Back to Dashboard
            </Link>
          )}

          {/* PWA Install Button */}
          <InstallPWAButton />
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

/* ---------------- App ---------------- */
function App() {
  return (
    <BrowserRouter>
      <GameLayout>
        <Routes>

          {/* 🌍 Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/symmetry"
            element={
              <ProtectedRoute>
                <SymmetryGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cleaning"
            element={
              <ProtectedRoute>
                <CleaningGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checking"
            element={
              <ProtectedRoute>
                <CheckingGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/intrusive-thoughts"
            element={
              <ProtectedRoute>
                <IntrusiveThoughtsGame />
              </ProtectedRoute>
            }
          />

        </Routes>
      </GameLayout>
    </BrowserRouter>
  );
}

export default App;
