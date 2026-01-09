import React, { useState, useEffect, useCallback } from 'react';
import '../index.css';
import { INITIAL_PIECES, GRID_SIZE, SUB_GRID_STEPS } from '../utils/symmetryData'

function SymmetryGame() {
  const [pieces, setPieces] = useState(INITIAL_PIECES);
  const [selectedId, setSelectedId] = useState(null);
  
  // Metrics for OCD Detection
  const [metrics, setMetrics] = useState({
    moves: 0,
    startTime: Date.now(),
    history: [] // For undo/redo analysis if needed later
  });

  // Calculate position percentage for CSS
  // subX 0 = 0%, subX 8 = 100%, subX 4 = 50%
  const getPositionStyle = (subX, subY) => {
    const stepSize = 100 / SUB_GRID_STEPS;
    return {
      left: `${subX * stepSize}%`,
      top: `${subY * stepSize}%`
    };
  };

  // Handle Keyboard Movement
  const handleKeyDown = useCallback((e) => {
    if (!selectedId) return;

    setPieces((prevPieces) => {
      return prevPieces.map((p) => {
        if (p.id !== selectedId) return p;

        let newSubX = p.subX;
        let newSubY = p.subY;
        let moved = false;

        // Logic 3.2: 1/8th movement restricted by box boundaries
        // Assuming (0,0) is Top-Left inside the box
        switch (e.key) {
          case 'ArrowUp':
            if (newSubY > 0) { newSubY--; moved = true; }
            break;
          case 'ArrowDown':
            if (newSubY < SUB_GRID_STEPS) { newSubY++; moved = true; }
            break;
          case 'ArrowLeft':
            if (newSubX > 0) { newSubX--; moved = true; }
            break;
          case 'ArrowRight':
            if (newSubX < SUB_GRID_STEPS) { newSubX++; moved = true; }
            break;
          default:
            return p;
        }

        if (moved) {
          // Update Metrics
          setMetrics(prev => ({ ...prev, moves: prev.moves + 1 }));
        }

        return { ...p, subX: newSubX, subY: newSubY };
      });
    });
  }, [selectedId]);

  // Attach Event Listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleReset = () => {
    setPieces(INITIAL_PIECES);
    setMetrics({ moves: 0, startTime: Date.now(), history: [] });
    setSelectedId(null);
  };

  const handleConfirm = () => {
    const timeTaken = (Date.now() - metrics.startTime) / 1000;
    
    // Prepare Data Payload for Backend (Section 6)
    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      timeTakenSeconds: timeTaken,
      totalMoves: metrics.moves,
      finalPositions: pieces,
      // Placeholder for symmetry scoring logic
      symmetryScore: calculateSymmetryScore(pieces) 
    };

    console.log("SENDING TO BACKEND:", payload);
    alert(`Submission Complete!\nMoves: ${metrics.moves}\nTime: ${timeTaken.toFixed(1)}s`);
  };

  // Mock Symmetry Score Logic (Conceptual)
  const calculateSymmetryScore = (finalPieces) => {
    // Basic example: Check if pieces are mirrored horizontally
    // Real logic would be more complex math
    return "Analyzing...";
  };

  // Helper to find which piece is in a specific cell to render it
  const getPieceInCell = (r, c) => {
    return pieces.find(p => p.boxY === r && p.boxX === c);
  };

  const currentPiece = pieces.find(p => p.id === selectedId);

  return (
    <div className="app">
      <header>
        <h1>Symmetry Detection Game</h1>
        <p>Arrange the buttons on the board in a way that feels visually balanced to you.</p>
      </header>

      {/* Board Section */}
      <div className="board-wrapper">
        <div className="board">
          {/* Create 6x6 Grid */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;
            const piece = getPieceInCell(row, col);

            return (
              <div key={index} className="cell">
                {piece && (
                  <div
                    className={`button ${piece.color} ${selectedId === piece.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(piece.id)}
                    style={getPositionStyle(piece.subX, piece.subY)}
                    role="button"
                    aria-label={`Piece at row ${row} col ${col}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel Section */}
      <div className="panel">
        <div className="card">
          <h3>Movement</h3>
          <p className="instruction">
            Click a button to select it.<br/>
            Use <strong>Arrow Keys</strong> to move it minutely (1/8 steps) within its box.
          </p>
        </div>

        <div className="card">
          <h3>Current Position</h3>
          {currentPiece ? (
            <div className="coords">
              Box: ({currentPiece.boxX}, {currentPiece.boxY}) <br/>
              Inside: ({currentPiece.subX}, {currentPiece.subY})
            </div>
          ) : (
            <div className="coords" style={{color: '#999'}}>Select a piece</div>
          )}
        </div>

        <div className="card">
          <h3>Metrics (Debug)</h3>
          <div className="coords">
            Moves: {metrics.moves} <br/>
            Time: {((Date.now() - metrics.startTime)/1000).toFixed(0)}s
          </div>
        </div>

        <div className="card">
          <h3>Actions</h3>
          <div className="actions">
            <button className="action-btn confirm" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="action-btn reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <footer>
        Calm • Non-judgmental • No time pressure
      </footer>
    </div>
  );
}

export default SymmetryGame;