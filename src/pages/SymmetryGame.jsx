import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';

// Constants
const GRID_SIZE = 6;
const SUB_GRID_STEPS = 8; 

const INITIAL_PIECES = [
  { id: 1, boxX: 0, boxY: 0, subX: 4, subY: 4, color: 'btn-green', confirmed: false },
  { id: 2, boxX: 5, boxY: 0, subX: 4, subY: 4, color: 'btn-blue', confirmed: false },
  { id: 3, boxX: 2, boxY: 1, subX: 4, subY: 4, color: 'btn-yellow', confirmed: false },
  { id: 4, boxX: 3, boxY: 3, subX: 4, subY: 4, color: 'btn-purple', confirmed: false },
];

// --- MOBILE D-PAD COMPONENT ---
// Fires synthetic KeyboardEvents so existing handleKeyDown picks them up unchanged.
// Rendered as a fixed overlay; only visible on touch devices via CSS.
function MobileDPad() {
  const fireKey = (key) => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    }));
  };

  // Repeat-fire while finger is held down
  const intervalRef = useRef(null);

  const startFiring = (key) => {
    fireKey(key); // immediate first press
    intervalRef.current = setInterval(() => fireKey(key), 120);
  };

  const stopFiring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const btnProps = (key) => ({
    onTouchStart: (e) => { e.preventDefault(); startFiring(key); },
    onTouchEnd:   (e) => { e.preventDefault(); stopFiring(); },
    onMouseDown:  () => startFiring(key),
    onMouseUp:    stopFiring,
    onMouseLeave: stopFiring,
  });

  return (
    <>
      <style>{`
        .mobile-dpad {
          display: none; /* hidden on desktop */
        }
        @media (hover: none), (pointer: coarse) {
          .mobile-dpad {
            display: grid;
            grid-template-columns: 52px 52px 52px;
            grid-template-rows: 52px 52px 52px;
            gap: 4px;
            position: fixed;
            bottom: 28px;
            right: 24px;
            z-index: 1000;
            user-select: none;
            -webkit-user-select: none;
          }
        }
        .dpad-btn {
          background: rgba(30, 30, 40, 0.82);
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          color: #fff;
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.1s, transform 0.08s;
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }
        .dpad-btn:active {
          background: rgba(80, 120, 220, 0.85);
          transform: scale(0.93);
        }
        .dpad-center {
          background: transparent;
          border: none;
          box-shadow: none;
          pointer-events: none;
        }
      `}</style>

      <div className="mobile-dpad" aria-label="Direction controls">
        {/* Row 1 */}
        <div />
        <button className="dpad-btn" aria-label="Up" {...btnProps('ArrowUp')}>▲</button>
        <div />
        {/* Row 2 */}
        <button className="dpad-btn" aria-label="Left"  {...btnProps('ArrowLeft')}>◀</button>
        <div className="dpad-btn dpad-center" />
        <button className="dpad-btn" aria-label="Right" {...btnProps('ArrowRight')}>▶</button>
        {/* Row 3 */}
        <div />
        <button className="dpad-btn" aria-label="Down" {...btnProps('ArrowDown')}>▼</button>
        <div />
      </div>
    </>
  );
}

function SymmetryGame() {
  const [pieces, setPieces] = useState(INITIAL_PIECES);
  const [selectedId, setSelectedId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  
  // --- VISUAL TIMER STATE ---
  const [elapsedTime, setElapsedTime] = useState(0);
  const nav = useNavigate();

  // --- TIMING REFS (For precision feature extraction) ---
  const gameStartTime = useRef(Date.now());
  const selectionStartTime = useRef(null); 
  const lastMoveTimeRef = useRef(Date.now());
  const moveSequence = useRef([]); // Feature 10 (Sequence)

  // --- METRICS STATE (Features 1-13) ---
  const [metrics, setMetrics] = useState({
    total_moves: 0,             // Feature 1
    moves_per_button: {},       // Feature 2
    time_per_button: {},        // Feature 6
    time_between_moves: [],     // Feature 7
    idle_time_before_confirm: 0,// Feature 8
    move_direction_counts: {    // Feature 11
      ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0 
    },
    fine_adjustment_moves: 0,   // Feature 12
    coarse_moves: 0             // Feature 13
  });

  // --- TIMER EFFECT: Updates the visual clock every second ---
  useEffect(() => {
    // Only run timer if game is active (not loading, no result yet)
    if (!isLoading && !resultData) {
      const timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStartTime.current) / 1000));
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [isLoading, resultData]);

  // Helper for CSS positioning
  const getPositionStyle = (subX, subY) => {
    const stepSize = 100 / SUB_GRID_STEPS;
    return {
      left: `${subX * stepSize}%`,
      top: `${subY * stepSize}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  // Helper for Result Colors
  const getColorForLabel = (label) => {
    switch(label) {
      case 'Minimal': return '#4caf50'; // Green
      case 'Mild': return '#2196f3';    // Blue
      case 'Moderate': return '#ff9800'; // Orange
      case 'Severe': return '#f44336';   // Red
      default: return '#666';
    }
  };

  // --- INTERACTION LOGIC ---

  // Handle Button Selection
  const handleSelect = (id) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece.confirmed) {
      const currentTime = Date.now();
      
      // If we were already selecting a different button, log that time
      if (selectedId && selectedId !== id && selectionStartTime.current) {
        const duration = (currentTime - selectionStartTime.current) / 1000;
        setMetrics(prev => ({
          ...prev,
          time_per_button: {
            ...prev.time_per_button,
            [selectedId]: (prev.time_per_button[selectedId] || 0) + duration
          }
        }));
      }

      setSelectedId(id);
      selectionStartTime.current = currentTime; 
    }
  };

  // Handle Movement
  const handleKeyDown = useCallback((e) => {
    if (!selectedId) return;
    
    // Filter only arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();

    // Total sub-steps across the full board
    const TOTAL_STEPS = GRID_SIZE * SUB_GRID_STEPS; // 6 * 8 = 48

    setPieces((prevPieces) => {
      const piece = prevPieces.find(p => p.id === selectedId);
      if (!piece || piece.confirmed) return prevPieces;

      // Convert box+sub coords to a single global coordinate (0 – TOTAL_STEPS-1)
      let globalX = piece.boxX * SUB_GRID_STEPS + piece.subX;
      let globalY = piece.boxY * SUB_GRID_STEPS + piece.subY;

      let newGlobalX = globalX;
      let newGlobalY = globalY;

      switch (e.key) {
        case 'ArrowUp':    newGlobalY = Math.max(0, globalY - 1); break;
        case 'ArrowDown':  newGlobalY = Math.min(TOTAL_STEPS - 1, globalY + 1); break;
        case 'ArrowLeft':  newGlobalX = Math.max(0, globalX - 1); break;
        case 'ArrowRight': newGlobalX = Math.min(TOTAL_STEPS - 1, globalX + 1); break;
        default: return prevPieces;
      }

      const moved = newGlobalX !== globalX || newGlobalY !== globalY;
      if (!moved) return prevPieces;

      // Derive new box and sub coords from global
      const newBoxX = Math.floor(newGlobalX / SUB_GRID_STEPS);
      const newBoxY = Math.floor(newGlobalY / SUB_GRID_STEPS);
      const newSubX = newGlobalX % SUB_GRID_STEPS;
      const newSubY = newGlobalY % SUB_GRID_STEPS;

      // No-overlap: block if the destination box is occupied by a different confirmed or unconfirmed piece
      const boxOccupied = prevPieces.some(
        other => other.id !== selectedId && other.boxX === newBoxX && other.boxY === newBoxY
      );
      if (boxOccupied) return prevPieces;

      // --- Feature collection (unchanged) ---
      const currentTime = Date.now();
      const timeDelta = (currentTime - lastMoveTimeRef.current) / 1000;
      lastMoveTimeRef.current = currentTime;

      moveSequence.current.push(e.key);
      const isFine = true;

      setMetrics(prev => ({
        ...prev,
        total_moves: prev.total_moves + 1,
        moves_per_button: {
          ...prev.moves_per_button,
          [piece.id]: (prev.moves_per_button[piece.id] || 0) + 1
        },
        time_between_moves: [...prev.time_between_moves, timeDelta],
        move_direction_counts: {
          ...prev.move_direction_counts,
          [e.key]: (prev.move_direction_counts[e.key] || 0) + 1
        },
        fine_adjustment_moves: isFine ? prev.fine_adjustment_moves + 1 : prev.fine_adjustment_moves,
        coarse_moves: !isFine ? prev.coarse_moves + 1 : prev.coarse_moves
      }));

      return prevPieces.map(p =>
        p.id === selectedId
          ? { ...p, boxX: newBoxX, boxY: newBoxY, subX: newSubX, subY: newSubY }
          : p
      );
    });
  }, [selectedId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle Confirmation
  const handleConfirmPiece = () => {
    if (!selectedId) {
      alert('Please select a piece first');
      return;
    }

    const currentTime = Date.now();
    const idleTime = (currentTime - lastMoveTimeRef.current) / 1000;

    let duration = 0;
    if (selectionStartTime.current) {
      duration = (currentTime - selectionStartTime.current) / 1000;
    }

    setMetrics(prev => ({
      ...prev,
      idle_time_before_confirm: idleTime, 
      time_per_button: {
        ...prev.time_per_button,
        [selectedId]: (prev.time_per_button[selectedId] || 0) + duration
      }
    }));

    setPieces(prev => prev.map(p => 
      p.id === selectedId ? { ...p, confirmed: true } : p
    ));
    
    setSelectedId(null);
    selectionStartTime.current = null;
  };

  const handleReset = () => {
    setPieces(INITIAL_PIECES);
    gameStartTime.current = Date.now();
    lastMoveTimeRef.current = Date.now();
    selectionStartTime.current = null;
    moveSequence.current = [];
    setElapsedTime(0); // Reset visual timer
    
    setMetrics({ 
      total_moves: 0,
      moves_per_button: {},
      time_per_button: {},
      time_between_moves: [],
      idle_time_before_confirm: 0,
      move_direction_counts: { ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0 },
      fine_adjustment_moves: 0,
      coarse_moves: 0
    });
    setSelectedId(null);
    setResultData(null);
    setIsLoading(false);
  };

  // --- FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    const allConfirmed = pieces.every(p => p.confirmed);
    if (!allConfirmed) {
      alert('Please confirm all pieces before submitting');
      return;
    }

    const total_time = (Date.now() - gameStartTime.current) / 1000;
    const mean_moves_per_button = metrics.total_moves / pieces.length;
    const movesArray = Object.values(metrics.moves_per_button);
    const max_moves_single_button = movesArray.length > 0 ? Math.max(...movesArray) : 0;

    const finalPayload = {
      total_moves: metrics.total_moves,
      moves_per_button: metrics.moves_per_button,
      mean_moves_per_button: parseFloat(mean_moves_per_button.toFixed(2)),
      max_moves_single_button: max_moves_single_button,
      total_time: parseFloat(total_time.toFixed(2)),
      time_per_button: metrics.time_per_button, 
      time_between_moves: metrics.time_between_moves, 
      idle_time_before_confirm: parseFloat(metrics.idle_time_before_confirm.toFixed(2)), 
      move_sequence_length: moveSequence.current.length, 
      move_direction_counts: { 
        up: metrics.move_direction_counts.ArrowUp,
        down: metrics.move_direction_counts.ArrowDown,
        left: metrics.move_direction_counts.ArrowLeft,
        right: metrics.move_direction_counts.ArrowRight
      },
      fine_adjustment_moves: metrics.fine_adjustment_moves, 
      coarse_moves: metrics.coarse_moves, 
      final_positions: pieces
    };

    console.log("SENDING TO BACKEND:", finalPayload);
    setIsLoading(true);
    const token = getToken();
    try {
      const response = await fetch('http://127.0.0.1:5000/get_ocd_level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          game_id: 1,
          input_data: finalPayload
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("BACKEND RESPONSE:", result);
      setResultData(result);

    } catch (error) {
      console.error("Error sending data:", error);
      alert("Failed to submit data. Please check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPieceInCell = (r, c) => {
    return pieces.find(p => p.boxY === r && p.boxX === c);
  };

  const currentPiece = pieces.find(p => p.id === selectedId);
  const allConfirmed = pieces.every(p => p.confirmed);

  // --- RENDER 1: RESULT VIEW ---
  if (resultData) {
    const { prediction } = resultData;
    const { label, description } = prediction;
    const labelColor = getColorForLabel(label);

    return (
      <div className="layout-container">
        <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div 
          className="app symmetry-app" 
          style={{ 
            textAlign: 'center', 
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px', 
            height: '100%' 
          }}
        >
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Analysis Complete</h2>
          
          <div style={{ 
            border: `2px solid ${labelColor}`, 
            borderRadius: '12px', 
            padding: '24px', 
            margin: '20px 0',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '450px', 
            width: '100%'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#666' }}>Symmetry Obsession Level</h3>
            <h1 style={{ 
              color: labelColor, 
              fontSize: '2.5rem', 
              margin: '15px 0',
              textTransform: 'uppercase'
            }}>
              {label}
            </h1>
            <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#444' }}>
              {description}
            </p>
          </div>

          <button 
            className="action-btn reset"
            onClick={handleReset} 
            style={{ 
              marginTop: '20px', 
              padding: '10px 30px', 
              fontSize: '1rem',
              height: 'auto',         
              minHeight: 'unset',     
              width: 'auto',          
              flex: 'none',           
              lineHeight: 'normal',   
              display: 'inline-block' 
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER 2: LOADING VIEW ---
  if (isLoading) {
    return (
      <div className="layout-container">
        <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div className="app symmetry-app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3', 
            borderTop: '5px solid #3498db', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <p style={{ marginTop: '20px', fontSize: '1.1rem' }}>Analyzing movement patterns...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // --- RENDER 3: GAME VIEW (Default) ---
  return (
    <div className="layout-container">
      <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      <div className="app symmetry-app">
        <header>
          <h1>Symmetry Detection Game</h1>
          <p>Arrange the buttons on the board in a way that feels visually balanced to you.</p>
        </header>

        <div className="board-wrapper">
          <div className="symmetry-board">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const row = Math.floor(index / GRID_SIZE);
              const col = index % GRID_SIZE;
              const piece = getPieceInCell(row, col);

              return (
                <div key={index} className="cell">
                  {piece && (
                    <div
                      className={`button ${piece.color} ${selectedId === piece.id ? 'selected' : ''} ${piece.confirmed ? 'confirmed' : ''}`}
                      onClick={() => handleSelect(piece.id)}
                      style={getPositionStyle(piece.subX, piece.subY)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="card">
            <h3>Movement</h3>
            <p className="instruction">
              Select a button and use your arrow keys to move it in small steps (1/8 of a box).
            </p>
          </div>

          <div className="card">
            <h3>Current Position</h3>
            {currentPiece ? (
              <div className="coords">
                Box: ({currentPiece.boxX}, {currentPiece.boxY}) | Inside: ({currentPiece.subX}, {currentPiece.subY})
              </div>
            ) : (
              <div className="coords text-muted">Select a button</div>
            )}
          </div>

          <div className="card">
            <h3>Stats</h3>
            <div className="coords">
              Moves: {metrics.total_moves}<br/>
              Time: {elapsedTime}s<br/>
              Confirmed: {pieces.filter(p => p.confirmed).length}/{pieces.length}
            </div>
          </div>

          <div className="card">
            <h3>Actions</h3>
            <div className="actions">
              <button 
                className="action-btn confirm"
                onClick={handleConfirmPiece}
                disabled={!selectedId}
              >
                Confirm
              </button>
              <button 
                className="action-btn reset"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
            {allConfirmed && (
              <button 
                className="action-btn submit"
                onClick={handleFinalSubmit}
                style={{ marginTop: '12px', width: '100%' }}
              >
                Submit
              </button>
            )}
          </div>
        </div>

        <footer>
          Calm • Non-judgmental • No time pressure
        </footer>
      </div>

      {/* Mobile D-Pad — only visible on touch devices, zero desktop impact */}
      <MobileDPad />
    </div>
  );
}

export default SymmetryGame;