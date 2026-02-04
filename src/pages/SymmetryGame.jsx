import React, { useState, useEffect, useCallback, useRef } from 'react';

// Constants
const GRID_SIZE = 6;
const SUB_GRID_STEPS = 8; 

const INITIAL_PIECES = [
  { id: 1, boxX: 0, boxY: 0, subX: 4, subY: 4, color: 'btn-green', confirmed: false },
  { id: 2, boxX: 5, boxY: 0, subX: 4, subY: 4, color: 'btn-blue', confirmed: false },
  { id: 3, boxX: 2, boxY: 1, subX: 4, subY: 4, color: 'btn-yellow', confirmed: false },
  { id: 4, boxX: 3, boxY: 3, subX: 4, subY: 4, color: 'btn-purple', confirmed: false },
];

function SymmetryGame() {
  const [pieces, setPieces] = useState(INITIAL_PIECES);
  const [selectedId, setSelectedId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  
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

  // Handle Button Selection (Feature 6: Time per button)
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

  // Handle Movement (Features 1, 2, 7, 10, 11, 12, 13)
  const handleKeyDown = useCallback((e) => {
    if (!selectedId) return;
    
    // Filter only arrow keys
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();

    setPieces((prevPieces) => {
      return prevPieces.map((p) => {
        if (p.id !== selectedId || p.confirmed) return p;

        let newSubX = p.subX;
        let newSubY = p.subY;
        let moved = false;

        switch (e.key) {
          case 'ArrowUp':
            if (newSubY > 0) { newSubY--; moved = true; }
            break;
          case 'ArrowDown':
            if (newSubY < SUB_GRID_STEPS-1) { newSubY++; moved = true; }
            break;
          case 'ArrowLeft':
            if (newSubX > 0) { newSubX--; moved = true; }
            break;
          case 'ArrowRight':
            if (newSubX < SUB_GRID_STEPS-1) { newSubX++; moved = true; }
            break;
          default: return p;
        }

        if (moved) {
          const currentTime = Date.now();
          const timeDelta = (currentTime - lastMoveTimeRef.current) / 1000; 
          lastMoveTimeRef.current = currentTime;
          
          // Feature 10: Log sequence
          moveSequence.current.push(e.key);

          // Feature 12 vs 13 Logic
          // In this game, all moves are 1/8th step (Fine). 
          // Coarse would be a full grid jump (not implemented in controls, but tracked).
          const isFine = true; 

          setMetrics(prev => ({
            ...prev,
            total_moves: prev.total_moves + 1, // Feature 1
            
            moves_per_button: { // Feature 2
              ...prev.moves_per_button,
              [p.id]: (prev.moves_per_button[p.id] || 0) + 1
            },
            
            time_between_moves: [...prev.time_between_moves, timeDelta], // Feature 7
            
            move_direction_counts: { // Feature 11
              ...prev.move_direction_counts,
              [e.key]: (prev.move_direction_counts[e.key] || 0) + 1
            },

            fine_adjustment_moves: isFine ? prev.fine_adjustment_moves + 1 : prev.fine_adjustment_moves, // Feature 12
            coarse_moves: !isFine ? prev.coarse_moves + 1 : prev.coarse_moves // Feature 13
          }));
        }

        return { ...p, subX: newSubX, subY: newSubY };
      });
    });
  }, [selectedId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle Confirmation (Feature 8: Idle time before confirm)
  const handleConfirmPiece = () => {
    if (!selectedId) {
      alert('Please select a piece first');
      return;
    }

    const currentTime = Date.now();
    
    // Feature 8: Time between last arrow key and confirm click
    const idleTime = (currentTime - lastMoveTimeRef.current) / 1000;

    // Feature 6: Finalize interaction time for this button
    let duration = 0;
    if (selectionStartTime.current) {
      duration = (currentTime - selectionStartTime.current) / 1000;
    }

    setMetrics(prev => ({
      ...prev,
      idle_time_before_confirm: idleTime, // Update latest idle time
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

  // --- FINAL SUBMISSION (Features 3, 4, 5 & Payload Construction) ---
  const handleFinalSubmit = async () => {
    const allConfirmed = pieces.every(p => p.confirmed);
    if (!allConfirmed) {
      alert('Please confirm all pieces before submitting');
      return;
    }

    // Feature 5: Total Time
    const total_time = (Date.now() - gameStartTime.current) / 1000;
    
    // Feature 3: Mean moves per button
    const mean_moves_per_button = metrics.total_moves / pieces.length;

    // Feature 4: Max moves single button
    const movesArray = Object.values(metrics.moves_per_button);
    const max_moves_single_button = movesArray.length > 0 ? Math.max(...movesArray) : 0;

    // Construct Payload exactly as requested in "Recommended Data Logging Format"
    const finalPayload = {
      total_moves: metrics.total_moves,
      moves_per_button: metrics.moves_per_button,
      mean_moves_per_button: parseFloat(mean_moves_per_button.toFixed(2)),
      max_moves_single_button: max_moves_single_button,
      total_time: parseFloat(total_time.toFixed(2)),
      time_per_button: metrics.time_per_button, // Feature 6
      time_between_moves: metrics.time_between_moves, // Feature 7
      idle_time_before_confirm: parseFloat(metrics.idle_time_before_confirm.toFixed(2)), // Feature 8 & 9
      move_sequence_length: moveSequence.current.length, // Feature 10
      move_direction_counts: { // Feature 11 (Mapped to simple keys)
        up: metrics.move_direction_counts.ArrowUp,
        down: metrics.move_direction_counts.ArrowDown,
        left: metrics.move_direction_counts.ArrowLeft,
        right: metrics.move_direction_counts.ArrowRight
      },
      fine_adjustment_moves: metrics.fine_adjustment_moves, // Feature 12
      coarse_moves: metrics.coarse_moves, // Feature 13
      
      // Backend Requirements (Positions)
      final_positions: pieces
    };

    console.log("SENDING TO BACKEND:", finalPayload);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/get_ocd_level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  if (resultData) {
    const { prediction } = resultData;
    const { label, description } = prediction;
    const labelColor = getColorForLabel(label);

    return (
      <div className="layout-container">
        <div 
          className="app symmetry-app" 
          style={{ 
            textAlign: 'center', 
            padding: '20px', // Reduced padding
            // --- FIX: Match Game Screen Size ---
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px', // Matches typical game board height
            height: '100%'      // Ensures it fills the container naturally without forcing overflow
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
            maxWidth: '450px', // Constrain width to look like a card
            width: '100%'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#666' }}>Symmetry Obsession Level</h3>
            <h1 style={{ 
              color: labelColor, 
              fontSize: '2.5rem', // Slightly smaller to fit better
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
              // --- BUTTON FIXES ---
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
              Time: {((Date.now() - gameStartTime.current)/1000).toFixed(0)}s<br/>
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
    </div>
  );
}

export default SymmetryGame;