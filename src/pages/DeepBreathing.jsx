import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeepBreathing.css';

export default function DeepBreathing() {
  const nav = useNavigate();
  
  // Logic States
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [timeLeft, setTimeLeft] = useState(4); // Seconds for current phase
  const [isActive, setIsActive] = useState(true); // Pause/Play state

  // Breathing Configuration (Seconds)
  const CYCLE = {
    Inhale: 4,
    Hold: 2,
    Exhale: 4
  };

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            // Transition to next phase
            handlePhaseTransition();
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]); // Re-run when active or phase changes

  const handlePhaseTransition = () => {
    switch (phase) {
      case 'Inhale':
        setPhase('Hold');
        setTimeLeft(CYCLE.Hold);
        break;
      case 'Hold':
        setPhase('Exhale');
        setTimeLeft(CYCLE.Exhale);
        break;
      case 'Exhale':
        setPhase('Inhale');
        setTimeLeft(CYCLE.Inhale);
        break;
      default:
        setPhase('Inhale');
        setTimeLeft(CYCLE.Inhale);
    }
  };

  const handleRestart = () => {
    setIsActive(false);
    setPhase('Inhale');
    setTimeLeft(CYCLE.Inhale);
    // Short timeout to visually reset before starting again
    setTimeout(() => setIsActive(true), 100);
  };

  // Dynamic instruction text based on phase
  const getInstructionText = () => {
    if (phase === 'Inhale') return 'Breathe In Slowly';
    if (phase === 'Hold') return 'Hold Breath';
    if (phase === 'Exhale') return 'Breathe Out Gently';
  };

  return (
    <div className="breathing-page">
          <button className="game-back-btn" onClick={() => nav('/game-dashboard')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
          </button>
      {/* Header */}
      <h1 className="breathing-title">Deep Breathing</h1>
      <p className="breathing-subtitle">Follow the breathing cycle</p>

      {/* Main Animation Area */}
      <div className="circle-container">
        {/* The Circle changes class based on phase for CSS Animation */}
        <div className={`breathing-circle ${phase.toLowerCase()} ${!isActive ? 'paused' : ''}`}>
          <span className="circle-text">{getInstructionText()}</span>
          <span className="timer-text">{timeLeft}s</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-container">
        <button className="control-btn" onClick={() => setIsActive(!isActive)}>
          {isActive ? 'Pause' : 'Resume'}
        </button>
        
        <button className="control-btn" onClick={handleRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}