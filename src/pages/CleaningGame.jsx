import React, { useState, useEffect } from 'react';
import '../index.css';
import { generateBoard } from '../utils/cleaningLogic';

function CleaningGame() {
  const [board, setBoard] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  
  // Game Metrics State
  const [startTime, setStartTime] = useState(Date.now());
  const [totalActions, setTotalActions] = useState(0);

  // Initialize Game
  useEffect(() => {
    setBoard(generateBoard());
    setStartTime(Date.now());
  }, []);

  // Helper: Current Tile Data
  const currentTile = selectedIdx !== null ? board[selectedIdx] : null;

  // --- Core Game Logic ---
  
  const handleToolAction = (tool) => {
    if (selectedIdx === null) return;
    
    setTotalActions(prev => prev + 1);

    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tile = { ...newBoard[selectedIdx] };

      // Update Tracking stats
      if (tool === 'spray') tile.userSprays += 1;
      if (tool === 'wipe') tile.userWipes += 1;

      // Cleaning Logic
      if (tile.isClean) {
        // Tile is already clean -> Over-cleaning
        tile.overCleanedCount += 1;
      } else {
        // Normal Cleaning Flow
        if (tool === 'spray') {
          tile.sprayed = true;
        } 
        else if (tool === 'wipe') {
          if (tile.sprayed) {
            // Valid Cleaning Unit (Spray + Wipe)
            tile.cleanedUnits += 1;
            tile.sprayed = false; // Reset cycle

            // Check if fully clean
            if (tile.cleanedUnits >= tile.requiredUnits) {
              tile.isClean = true;
            }
          }
        }
      }

      newBoard[selectedIdx] = tile;
      return newBoard;
    });
  };

  // --- Rendering Helpers ---

  const renderContent = (tile) => {
    if (tile.type === 'empty') return null;
    
    // Visual opacity logic: Fades as you clean it
    // If clean, it disappears (opacity 0) or shows clean state
    const progress = tile.requiredUnits > 0 ? tile.cleanedUnits / tile.requiredUnits : 1;
    const opacity = Math.max(0, 1 - progress); 

    if (tile.isClean) return null; // Remove visually if clean

    if (tile.type === 'dirt') {
      // Visual scaling for dirt dots based on 'size'
      // size 1=2px, size 5=12px approx (conceptual scaling)
      const pxSize = tile.size * 2 + 4; 
      // Randomize position slightly for realism (using id as seed roughly)
      const top = 10 + (tile.id * 7 % 40); 
      const left = 10 + (tile.id * 3 % 40);
      
      return (
        <div 
          className="dirt" 
          style={{ 
            width: pxSize, 
            height: pxSize, 
            top: `${top}px`, 
            left: `${left}px`,
            opacity 
          }} 
        />
      );
    }

    if (tile.type === 'germ') {
      return (
        <div 
          className="germ" 
          style={{ top: '24px', left: '24px', opacity }} 
        />
      );
    }

    if (tile.type === 'contamination') {
      // Size comes from config (10, 20, 30...)
      return (
        <div 
          className="contamination" 
          style={{ 
            width: `${tile.size}px`, 
            height: `${tile.size}px`,
            opacity: opacity * 0.85 
          }} 
        />
      );
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Cleaning & Contamination Detection Game</h1>
        <p>Clean the tiles using spray and wiper in the way that feels necessary to you.</p>
      </header>

      {/* Floor Board */}
      <div className="board-wrapper">
        <div className="floor">
          {board.map((tile, index) => (
            <div 
              key={tile.id}
              className={`tile ${selectedIdx === index ? 'selected' : ''} ${tile.isClean && tile.type !== 'empty' ? 'clean' : ''}`}
              onClick={() => setSelectedIdx(index)}
            >
              {renderContent(tile)}
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="panel">
        <div className="card">
          <h3>Instructions</h3>
          <p className="instruction">
            1. Select a dirty tile.<br/>
            2. Click <b>Spray</b> first.<br/>
            3. Then click <b>Wiper</b>.<br/>
            Each Spray+Wipe = 1 Cleaning Unit.
          </p>
        </div>

        <div className="card">
          <h3>Cleaning Tools</h3>
          <div className="tools">
            <button 
              className="tool" 
              onClick={() => handleToolAction('spray')}
            >
              Spray
            </button>
            <button 
              className="tool" 
              onClick={() => handleToolAction('wipe')}
            >
              Wiper
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Cleaning Status</h3>
          {currentTile ? (
            <>
              <div className="feedback">
                Type: {currentTile.type.toUpperCase()}<br/>
                Required: ({currentTile.requiredUnits}w, {currentTile.requiredUnits}s)<br/>
                You used: ({currentTile.userWipes}w, {currentTile.userSprays}s)
              </div>
              
              {currentTile.isClean && currentTile.type !== 'empty' && (
                <div style={{marginTop: 8, color: 'var(--success)', fontWeight: 'bold'}}>
                  ✓ Tile Cleaned
                </div>
              )}

              {currentTile.overCleanedCount > 0 && (
                <div className="warning">
                  ⚠️ This tile is already clean.
                  <br/>Over-cleaned: {currentTile.overCleanedCount} times.
                </div>
              )}
            </>
          ) : (
            <div className="feedback" style={{color: '#999'}}>
              Select a tile to inspect details.
            </div>
          )}
        </div>
      </div>

      <footer>
        No alerts • No penalties • Behavioral observation only
      </footer>
    </div>
  );
}

export default CleaningGame;