import React, { useState, useEffect, useCallback } from 'react';

// Constants (Section 2 & 3)
const GRID_SIZE = 6;
const SUB_GRID_STEPS = 8; // Section 3.2: 1/8 subdivisions per box (0 to 8)

const INITIAL_PIECES = [
  { id: 1, boxX: 0, boxY: 0, subX: 4, subY: 4, color: 'btn-green', confirmed: false },
  { id: 2, boxX: 5, boxY: 0, subX: 4, subY: 4, color: 'btn-blue', confirmed: false },
  { id: 3, boxX: 2, boxY: 1, subX: 4, subY: 4, color: 'btn-yellow', confirmed: false },
  { id: 4, boxX: 3, boxY: 3, subX: 4, subY: 4, color: 'btn-purple', confirmed: false },
];

function SymmetryGame() {
  const [pieces, setPieces] = useState(INITIAL_PIECES);
  const [selectedId, setSelectedId] = useState(null);
  
  // Section 4.1 & 6: Metrics for OCD Detection
  const [metrics, setMetrics] = useState({
    moves: 0,
    startTime: Date.now(),
    moveHistory: [], // Movement patterns and frequency
    movesPerButton: {}, // Number of moves per button
    adjustmentCount: {}, // Repeated adjustments per button
    timeSpentPerButton: {}, // Time tracking
    selectionCount: {} // Track how many times each button was selected
  });

  // Section 3.1: Calculate position percentage for CSS (1/8 steps)
  const getPositionStyle = (subX, subY) => {
    const stepSize = 100 / SUB_GRID_STEPS;
    return {
      left: `${subX * stepSize}%`,
      top: `${subY * stepSize}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  // Section 3.1 & 3.2: Handle Keyboard Movement with Boundary Conditions
  const handleKeyDown = useCallback((e) => {
    if (!selectedId) return;
    
    // Prevent default arrow key behavior
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    setPieces((prevPieces) => {
      return prevPieces.map((p) => {
        if (p.id !== selectedId || p.confirmed) return p;

        let newSubX = p.subX;
        let newSubY = p.subY;
        let moved = false;

        // Section 3.2: Movement restrictions based on boundary conditions
        // Inside-box coordinate: (0,0) to (8,8)
        switch (e.key) {
          case 'ArrowUp':
            // Move up → decrease Y
            if (newSubY > 0) {
              newSubY--;
              moved = true;
            }
            break;

          case 'ArrowDown':
            // Move down → increase Y
            if (newSubY < SUB_GRID_STEPS-1) {
              newSubY++;
              moved = true;
            }
            break;

          case 'ArrowLeft':
            if (newSubX > 0) {
              newSubX--;
              moved = true;
            }
            break;

          case 'ArrowRight':
            if (newSubX < SUB_GRID_STEPS-1) {
              newSubX++;
              moved = true;
            }
            break;

          default:
            return p;
        }

        if (moved) {
          const currentTime = Date.now();
          
          // Section 6: Track movement patterns and frequency
          setMetrics(prev => ({
            ...prev,
            moves: prev.moves + 1,
            moveHistory: [...prev.moveHistory, {
              pieceId: p.id,
              timestamp: currentTime,
              from: { boxX: p.boxX, boxY: p.boxY, subX: p.subX, subY: p.subY },
              to: { boxX: p.boxX, boxY: p.boxY, subX: newSubX, subY: newSubY },
              direction: e.key
            }],
            movesPerButton: {
              ...prev.movesPerButton,
              [p.id]: (prev.movesPerButton[p.id] || 0) + 1
            },
            adjustmentCount: {
              ...prev.adjustmentCount,
              [p.id]: (prev.adjustmentCount[p.id] || 0) + 1
            }
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

  // Section 3.1: Select button by clicking
  const handleSelect = (id) => {
    const piece = pieces.find(p => p.id === id);
    if (!piece.confirmed) {
      const previousId = selectedId;
      setSelectedId(id);
      
      // Track selection count (anxiety-driven corrections indicator)
      setMetrics(prev => ({
        ...prev,
        selectionCount: {
          ...prev.selectionCount,
          [id]: (prev.selectionCount[id] || 0) + 1
        }
      }));
      
      // Track time spent per button
      if (previousId && previousId !== id) {
        setMetrics(prev => ({
          ...prev,
          timeSpentPerButton: {
            ...prev.timeSpentPerButton,
            [previousId]: (prev.timeSpentPerButton[previousId] || 0) + (Date.now() - prev.startTime)
          }
        }));
      }
    }
  };

  const handleReset = () => {
    setPieces(INITIAL_PIECES);
    setMetrics({ 
      moves: 0, 
      startTime: Date.now(), 
      moveHistory: [],
      movesPerButton: {},
      adjustmentCount: {},
      timeSpentPerButton: {},
      selectionCount: {}
    });
    setSelectedId(null);
  };

  // Section 3.3: Confirm placement - button becomes fixed
  const handleConfirmPiece = () => {
    if (!selectedId) {
      alert('Please select a piece first');
      return;
    }

    setPieces(prev => prev.map(p => 
      p.id === selectedId ? { ...p, confirmed: true } : p
    ));
    
    // Track time for this button
    setMetrics(prev => ({
      ...prev,
      timeSpentPerButton: {
        ...prev.timeSpentPerButton,
        [selectedId]: (prev.timeSpentPerButton[selectedId] || 0) + (Date.now() - prev.startTime)
      }
    }));
    
    setSelectedId(null);
  };

  const handleFinalSubmit = () => {
    const allConfirmed = pieces.every(p => p.confirmed);
    if (!allConfirmed) {
      alert('Please confirm all pieces before submitting');
      return;
    }

    const timeTaken = (Date.now() - metrics.startTime) / 1000;
    
    // Section 4: Calculate symmetry detection metrics
    const symmetryAnalysis = calculateSymmetryScore(pieces);
    
    // Section 6 & 7: Prepare complete data for OCD detection model
    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      gameName: 'Symmetry Detection Game',
      timeTakenSeconds: timeTaken,
      totalMoves: metrics.moves,
      
      // Section 4.1: Final coordinates of every button
      finalPositions: pieces.map(p => ({
        id: p.id,
        color: p.color,
        boxCoordinate: { x: p.boxX, y: p.boxY },
        insideBoxCoordinate: { x: p.subX, y: p.subY },
        confirmed: p.confirmed
      })),
      
      // Section 4.1 & 6: Number of moves per button
      movesPerButton: metrics.movesPerButton,
      
      // Section 6: Movement patterns and frequency
      moveHistory: metrics.moveHistory,
      
      // Section 7: Repeated adjustments (anxiety-driven corrections)
      adjustmentCount: metrics.adjustmentCount,
      selectionCount: metrics.selectionCount,
      
      // Section 6: Time spent achieving alignment
      timeSpentPerButton: metrics.timeSpentPerButton,
      
      // Section 4.1 & 4.2: Symmetry scoring
      symmetryAnalysis,
      
      // Section 7: Behavioral profile for OCD detection
      behaviorProfile: {
        averageMovesPerButton: (metrics.moves / pieces.length).toFixed(2),
        totalAdjustments: Object.values(metrics.adjustmentCount).reduce((a, b) => a + b, 0),
        symmetryScore: symmetryAnalysis.overallScore,
        precisionLevel: symmetryAnalysis.precisionLevel,
        timeSpent: timeTaken,
        obsessionIndicator: calculateObsessionScore(metrics, symmetryAnalysis)
      }
    };

    console.log("SENDING TO BACKEND (Section 6 - OCD Detection):", payload);
    alert(`Submission Complete!\n\nMoves: ${metrics.moves}\nTime: ${timeTaken.toFixed(1)}s\nSymmetry Score: ${symmetryAnalysis.overallScore}%\nPrecision: ${symmetryAnalysis.precisionLevel}\nOCD Indicator: ${payload.behaviorProfile.obsessionIndicator}/10`);
  };

  // Section 7: Calculate obsession score based on behavior
  const calculateObsessionScore = (metrics, symmetryAnalysis) => {
    let score = 0;
    
    // High number of moves indicates perfectionism
    const avgMoves = metrics.moves / pieces.length;
    if (avgMoves > 50) score += 3;
    else if (avgMoves > 30) score += 2;
    else if (avgMoves > 15) score += 1;
    
    // Multiple selections of same button
    const maxSelections = Math.max(...Object.values(metrics.selectionCount));
    if (maxSelections > 10) score += 2;
    else if (maxSelections > 5) score += 1;
    
    // High symmetry score with high precision indicates compulsion
    if (symmetryAnalysis.overallScore > 80 && avgMoves > 20) score += 3;
    else if (symmetryAnalysis.overallScore > 60 && avgMoves > 15) score += 2;
    
    // Time spent (excessive time on alignment)
    const totalTime = (Date.now() - metrics.startTime) / 1000;
    if (totalTime > 300) score += 2; // 5+ minutes
    
    return Math.min(score, 10);
  };

  // Section 4.1 & 4.2: Calculate symmetry along vertical, horizontal, and diagonal axes
  const calculateSymmetryScore = (finalPieces) => {
    let totalScore = 0;
    const maxScore = 100;
    
    // Section 4.1: Vertical axis symmetry
    let verticalSymmetry = 0;
    finalPieces.forEach(piece => {
      const mirrorX = GRID_SIZE - 1 - piece.boxX;
      const mirrorPiece = finalPieces.find(p => 
        p.id !== piece.id && 
        p.boxX === mirrorX && 
        p.boxY === piece.boxY
      );
      
      if (mirrorPiece) {
        // Check sub-grid precision (Section 4.2)
        const subMirrorX = SUB_GRID_STEPS - piece.subX;
        const subPrecision = Math.abs(mirrorPiece.subX - subMirrorX);
        const subYPrecision = Math.abs(mirrorPiece.subY - piece.subY);
        
        if (subPrecision <= 1 && subYPrecision <= 1) {
          verticalSymmetry += 15; // High precision
        } else if (subPrecision <= 2 && subYPrecision <= 2) {
          verticalSymmetry += 10; // Medium precision
        } else {
          verticalSymmetry += 5; // General alignment
        }
      }
    });
    
    // Section 4.1: Horizontal axis symmetry
    let horizontalSymmetry = 0;
    finalPieces.forEach(piece => {
      const mirrorY = GRID_SIZE - 1 - piece.boxY;
      const mirrorPiece = finalPieces.find(p => 
        p.id !== piece.id && 
        p.boxY === mirrorY && 
        p.boxX === piece.boxX
      );
      
      if (mirrorPiece) {
        const subMirrorY = SUB_GRID_STEPS - piece.subY;
        const subPrecision = Math.abs(mirrorPiece.subY - subMirrorY);
        const subXPrecision = Math.abs(mirrorPiece.subX - piece.subX);
        
        if (subPrecision <= 1 && subXPrecision <= 1) {
          horizontalSymmetry += 15;
        } else if (subPrecision <= 2 && subXPrecision <= 2) {
          horizontalSymmetry += 10;
        } else {
          horizontalSymmetry += 5;
        }
      }
    });
    
    // Section 4.1: Diagonal symmetry
    let diagonalSymmetry = 0;
    finalPieces.forEach(piece => {
      // Main diagonal
      const diagMirror1 = finalPieces.find(p => 
        p.id !== piece.id && 
        p.boxX === piece.boxY && 
        p.boxY === piece.boxX
      );
      if (diagMirror1) diagonalSymmetry += 10;
      
      // Anti-diagonal
      const diagMirror2 = finalPieces.find(p => 
        p.id !== piece.id && 
        p.boxX === (GRID_SIZE - 1 - piece.boxY) && 
        p.boxY === (GRID_SIZE - 1 - piece.boxX)
      );
      if (diagMirror2) diagonalSymmetry += 10;
    });
    
    totalScore = Math.min(verticalSymmetry + horizontalSymmetry + diagonalSymmetry, maxScore);
    
    // Section 4.2: Determine precision level
    let precisionLevel = 'Low - Random or non-aligned placement';
    if (totalScore >= 80) {
      precisionLevel = 'High - Perfect symmetry with high precision';
    } else if (totalScore >= 50) {
      precisionLevel = 'Medium - General order but not perfectly mirrored';
    }
    
    return {
      overallScore: totalScore,
      verticalSymmetry,
      horizontalSymmetry,
      diagonalSymmetry,
      precisionLevel,
      // Section 4.1: Ratio of symmetric alignment
      symmetryRatios: {
        vertical: (verticalSymmetry / 60) * 100,
        horizontal: (horizontalSymmetry / 60) * 100,
        diagonal: (diagonalSymmetry / 40) * 100
      }
    };
  };

  const getPieceInCell = (r, c) => {
    return pieces.find(p => p.boxY === r && p.boxX === c);
  };

  const currentPiece = pieces.find(p => p.id === selectedId);
  const allConfirmed = pieces.every(p => p.confirmed);

  return (
    <div className="layout-container">
      <div className="app symmetry-app">
        {/* Section 5.1: Top - Game title and instructions */}
        <header>
          <h1>Symmetry Detection Game</h1>
          <p>Arrange the buttons on the board in a way that feels visually balanced to you.</p>
        </header>

        {/* Section 5.1: Center - Grid board with colored buttons */}
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

        {/* Section 5.1: Right/Bottom - Movement instruction panel */}
        <div className="panel">
          <div className="card">
            <h3>Movement</h3>
            <p className="instruction">
              Select a button and use your arrow keys to move it in small steps (1/8 of a box).
            </p>
          </div>

          {/* Section 5.2: Coordinate display showing (box_x, box_y) and (inside_x, inside_y) */}
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
              Moves: {metrics.moves}<br/>
              Time: {((Date.now() - metrics.startTime)/1000).toFixed(0)}s<br/>
              Confirmed: {pieces.filter(p => p.confirmed).length}/{pieces.length}
            </div>
          </div>

          {/* Section 5.1: Final - Confirm button and Reset button */}
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