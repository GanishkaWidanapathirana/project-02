import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SymmetryGame from './pages/SymmetryGame';
import CleaningGame from './pages/CleaningGame';
import './index.css';

// Simple wrapper to show a "Back to Dashboard" button on game pages
const GameLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="layout-container">
      <div style={{ width: '100%' }}>
        {!isDashboard && (
          <div style={{ marginBottom: '16px', maxWidth: '1150px', margin: '0 auto 16px' }}>
            <Link 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                color: 'var(--text-soft)', 
                fontWeight: '600',
                display: 'flex', 
                alignItems: 'center',
                gap: '8px' 
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <GameLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/symmetry" element={<SymmetryGame />} />
          <Route path="/cleaning" element={<CleaningGame />} />
          {/* Add future games here easily */}
          {/* <Route path="/game3" element={<NewGame />} /> */}
        </Routes>
      </GameLayout>
    </BrowserRouter>
  );
}

export default App;