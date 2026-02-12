import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Page Imports
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import GameDashboard from './pages/GameDashboard';
import DeepBreathing from './pages/DeepBreathing';

// Game Imports
import SymmetryGame from './pages/SymmetryGame';
import CleaningGame from './pages/CleaningGame';
import CheckingGame from './pages/CheckingGame';
import IntrusiveThoughtsGame from './pages/IntrusiveThoughtsGame';

// Components & CSS
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

/* ---------------- PWA Install Button (Floating Top-Right) ---------------- */
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
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999, /* Ensures it sits on top of everything */
        padding: '10px 20px',
        backgroundColor: '#ffffff',
        color: '#a594f9',
        borderRadius: '30px',
        border: 'none',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'Quicksand, sans-serif'
      }}
    >
      ⬇ Install App
    </button>
  );
};

/* ---------------- App Component ---------------- */
function App() {
  return (
    <BrowserRouter>
      {/* The Install Button sits outside Routes so it's always available */}
      <InstallPWAButton />

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
          path="/welcome"
          element={
            <ProtectedRoute>
             <Welcome />
            </ProtectedRoute>
          }
        />
        {/* If you are using the new GameDashboard instead of standard Dashboard, switch the component above */}
        <Route
          path="/game-dashboard"
          element={
            <ProtectedRoute>
              <GameDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mindfulness"
          element={
            <ProtectedRoute>
              <DeepBreathing />
            </ProtectedRoute>
          }
        />

        {/* 🎮 Game Routes */}
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
    </BrowserRouter>
  );
}

export default App;