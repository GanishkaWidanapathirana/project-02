import React, { useState, useEffect } from 'react';

// Constants from Game Spec
const GRID_SIZE = 8;

// Dirt configuration from spec (Section 3.1)
const DIRT_CONFIG = {
  1: { count: [0, 20], required: 1 },
  2: { count: [0, 10], required: 2 },
  3: { count: [0, 5], required: 3 },
  4: { count: [0, 3], required: 4 },
  5: { count: [0, 2], required: 5 }
};

// Germ configuration (Section 3.2)
const GERM_CONFIG = {
  count: [0, 3],
  required: 1,
  size: 2
};

// Contamination configuration (Section 3.3)
const CONTAMINATION_CONFIG = {
  10: { count: [0, 1], required: 10 },
  20: { count: [0, 1], required: 15 },
  30: { count: [0, 1], required: 20 },
  40: { count: [0, 1], required: 25 },
  50: { count: [0, 1], required: 30 }
};

// Helper to get random number in range
const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate game board with random dirt/germs/contamination
const generateBoard = () => {
  const tiles = Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, idx) => ({
    id: idx,
    type: 'empty',
    size: 0,
    requiredUnits: 0,
    cleanedUnits: 0,
    userSprays: 0,
    userWipes: 0,
    sprayed: false,
    isClean: true,
    overCleanedCount: 0,
    checkCount: 0,
    firstCleanTime: null
  }));

  const availableIndices = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  const usedIndices = new Set();

  const placeItems = (type, sizes, config) => {
    Object.entries(sizes).forEach(([size, data]) => {
      const count = randomInRange(data.count[0], data.count[1]);
      for (let i = 0; i < count; i++) {
        if (availableIndices.length === 0) return;
        
        const randomIdx = Math.floor(Math.random() * availableIndices.length);
        const tileIdx = availableIndices[randomIdx];
        
        if (!usedIndices.has(tileIdx)) {
          tiles[tileIdx] = {
            ...tiles[tileIdx],
            type,
            size: parseInt(size),
            requiredUnits: data.required,
            isClean: false
          };
          usedIndices.add(tileIdx);
          availableIndices.splice(randomIdx, 1);
        }
      }
    });
  };

  // Place dirt dots
  placeItems('dirt', DIRT_CONFIG);
  
  // Place germs
  const germCount = randomInRange(GERM_CONFIG.count[0], GERM_CONFIG.count[1]);
  for (let i = 0; i < germCount; i++) {
    if (availableIndices.length === 0) break;
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    const tileIdx = availableIndices[randomIdx];
    
    tiles[tileIdx] = {
      ...tiles[tileIdx],
      type: 'germ',
      size: GERM_CONFIG.size,
      requiredUnits: GERM_CONFIG.required,
      isClean: false
    };
    usedIndices.add(tileIdx);
    availableIndices.splice(randomIdx, 1);
  }

  // Place contamination zones
  const contaminationSizes = [10, 20, 30, 40, 50];
  const selectedSize = contaminationSizes[Math.floor(Math.random() * contaminationSizes.length)];
  const contConfig = CONTAMINATION_CONFIG[selectedSize];
  const contCount = randomInRange(contConfig.count[0], contConfig.count[1]);
  
  for (let i = 0; i < contCount; i++) {
    if (availableIndices.length === 0) break;
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    const tileIdx = availableIndices[randomIdx];
    
    tiles[tileIdx] = {
      ...tiles[tileIdx],
      type: 'contamination',
      size: selectedSize,
      requiredUnits: contConfig.required,
      isClean: false
    };
    usedIndices.add(tileIdx);
    availableIndices.splice(randomIdx, 1);
  }

  return tiles;
};

function CleaningGame() {
  const [board, setBoard] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  
  // Metrics for OCD Detection (Section 6.1)
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    totalSprays: 0,
    totalWipes: 0,
    overCleaningInstances: 0,
    tileCheckCount: {},
    cleaningOrder: [],
    timePerTile: {}
  });

  // Initialize Game
  useEffect(() => {
    setBoard(generateBoard());
    setMetrics(prev => ({ ...prev, startTime: Date.now() }));
  }, []);

  const currentTile = selectedIdx !== null ? board[selectedIdx] : null;

  // Track tile selection for rechecking behavior
  const handleTileSelect = (index) => {
    setSelectedIdx(index);
    setActiveTool(null);
    
    setMetrics(prev => ({
      ...prev,
      tileCheckCount: {
        ...prev.tileCheckCount,
        [index]: (prev.tileCheckCount[index] || 0) + 1
      }
    }));
  };

  // Handle cleaning actions (Section 4 & 5)
  const handleToolAction = (tool) => {
    if (selectedIdx === null) return;
    
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tile = { ...newBoard[selectedIdx] };

      // Update tool tracking
      if (tool === 'spray') {
        tile.userSprays += 1;
        tile.sprayed = true;
        setActiveTool('spray');
        
        setMetrics(prev => ({
          ...prev,
          totalSprays: prev.totalSprays + 1
        }));
      } 
      else if (tool === 'wipe') {
        tile.userWipes += 1;
        setActiveTool('wipe');
        
        setMetrics(prev => ({
          ...prev,
          totalWipes: prev.totalWipes + 1
        }));

        // Check if spray was used first (proper cleaning sequence)
        if (tile.sprayed && !tile.isClean) {
          tile.cleanedUnits += 1;
          tile.sprayed = false;

          // Check if tile is now fully clean
          if (tile.cleanedUnits >= tile.requiredUnits) {
            tile.isClean = true;
            tile.firstCleanTime = Date.now();
            
            setMetrics(prev => ({
              ...prev,
              cleaningOrder: [...prev.cleaningOrder, {
                tileId: selectedIdx,
                type: tile.type,
                size: tile.size,
                timestamp: Date.now()
              }],
              timePerTile: {
                ...prev.timePerTile,
                [selectedIdx]: Date.now() - prev.startTime
              }
            }));
          }
        }
      }

      // Detect over-cleaning (Section 6.1)
      if (tile.isClean && (tool === 'spray' || tool === 'wipe')) {
        tile.overCleanedCount += 1;
        
        setMetrics(prev => ({
          ...prev,
          overCleaningInstances: prev.overCleaningInstances + 1
        }));
      }

      newBoard[selectedIdx] = tile;
      return newBoard;
    });
  };

  const handleReset = () => {
    setBoard(generateBoard());
    setSelectedIdx(null);
    setActiveTool(null);
    setMetrics({
      startTime: Date.now(),
      totalSprays: 0,
      totalWipes: 0,
      overCleaningInstances: 0,
      tileCheckCount: {},
      cleaningOrder: [],
      timePerTile: {}
    });
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - metrics.startTime) / 1000;
    const cleanedTiles = board.filter(t => t.isClean && t.type !== 'empty');
    const dirtyTiles = board.filter(t => !t.isClean && t.type !== 'empty');
    
    // Calculate OCD scores (Section 6.2)
    const totalRequired = board.reduce((sum, t) => sum + t.requiredUnits, 0);
    const totalUsed = metrics.totalSprays + metrics.totalWipes;
    const overCleaningRatio = totalRequired > 0 ? (totalUsed / (totalRequired * 2)) : 0;
    
    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      timeTakenSeconds: timeTaken,
      metrics: {
        ...metrics,
        cleanedTiles: cleanedTiles.length,
        dirtyTiles: dirtyTiles.length,
        overCleaningRatio,
        efficiencyScore: totalRequired > 0 ? (totalRequired * 2) / totalUsed : 1
      },
      finalBoard: board.map(t => ({
        id: t.id,
        type: t.type,
        size: t.size,
        required: t.requiredUnits,
        used: { sprays: t.userSprays, wipes: t.userWipes },
        isClean: t.isClean,
        overCleaned: t.overCleanedCount
      }))
    };

    console.log("SENDING TO BACKEND:", payload);
    alert(`Cleaning Complete!\nTime: ${timeTaken.toFixed(1)}s\nCleaned: ${cleanedTiles.length} tiles\nOver-cleaning instances: ${metrics.overCleaningInstances}`);
  };

  // Render dirt/germ/contamination visuals
  const renderContent = (tile) => {
    if (tile.type === 'empty') return null;
    
    const progress = tile.requiredUnits > 0 ? tile.cleanedUnits / tile.requiredUnits : 1;
    const opacity = Math.max(0.1, 1 - progress);

    if (tile.isClean) return null;

    if (tile.type === 'dirt') {
      const pxSize = tile.size * 2 + 4;
      const top = 10 + (tile.id * 7 % 45);
      const left = 10 + (tile.id * 3 % 45);
      
      return (
        <div 
          className="dirt"
          style={{
            width: `${pxSize}px`,
            height: `${pxSize}px`,
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
          style={{ opacity }} 
        />
      );
    }

    if (tile.type === 'contamination') {
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

  const dirtyCount = board.filter(t => !t.isClean && t.type !== 'empty').length;
  const cleanCount = board.filter(t => t.isClean && t.type !== 'empty').length;

  return (
    <div className="layout-container">
      <div className="app cleaning-app">
        <header>
          <h1>Cleaning & Contamination Detection Game</h1>
          <p>Clean the tiles using spray and wiper in the way that feels necessary to you.</p>
        </header>

        <div className="board-wrapper">
          <div className="cleaning-floor">
            {board.map((tile, index) => (
              <div
                key={tile.id}
                className={`tile ${selectedIdx === index ? 'selected' : ''} ${tile.isClean && tile.type !== 'empty' ? 'clean' : ''}`}
                onClick={() => handleTileSelect(index)}
              >
                {renderContent(tile)}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="card">
            <h3>Instructions</h3>
            <p className="instruction">
              1. Select a dirty tile.<br/>
              2. Click <strong>Spray</strong> first.<br/>
              3. Then click <strong>Wiper</strong>.<br/>
              Each Spray + Wipe = 1 Cleaning Unit.
            </p>
          </div>

          <div className="card">
            <h3>Cleaning Tools</h3>
            <div className="tools">
              <button
                className={`tool ${activeTool === 'spray' ? 'active' : ''}`}
                onClick={() => handleToolAction('spray')}
                disabled={selectedIdx === null}
              >
                🧴 Spray
              </button>
              <button
                className={`tool ${activeTool === 'wipe' ? 'active' : ''}`}
                onClick={() => handleToolAction('wipe')}
                disabled={selectedIdx === null}
              >
                🧹 Wiper
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Cleaning Status</h3>
            {currentTile ? (
              <>
                <div className="feedback">
                  Type: {currentTile.type.toUpperCase()}<br/>
                  {currentTile.size > 0 && `Size: ${currentTile.size}px`}<br/>
                  Required: ({currentTile.requiredUnits}w, {currentTile.requiredUnits}s)<br/>
                  You used: ({currentTile.userWipes}w, {currentTile.userSprays}s)<br/>
                  Progress: {currentTile.cleanedUnits}/{currentTile.requiredUnits}
                </div>
                
                {currentTile.isClean && currentTile.type !== 'empty' && (
                  <div className="clean-status">
                    ✓ Tile Cleaned
                  </div>
                )}

                {currentTile.overCleanedCount > 0 && (
                  <div className="warning-msg">
                    ⚠️ This tile is already clean.<br/>
                    Over-cleaned: {currentTile.overCleanedCount} times.
                  </div>
                )}

                {metrics.tileCheckCount[selectedIdx] > 3 && (
                  <div className="warning-msg">
                    Rechecked {metrics.tileCheckCount[selectedIdx]} times
                  </div>
                )}
              </>
            ) : (
              <div className="feedback text-muted">
                Select a tile to see details
              </div>
            )}
          </div>

          <div className="card">
            <h3>Progress</h3>
            <div className="feedback">
              Dirty: {dirtyCount} tiles<br/>
              Cleaned: {cleanCount} tiles<br/>
              Time: {((Date.now() - metrics.startTime) / 1000).toFixed(0)}s<br/>
              Over-cleaning: {metrics.overCleaningInstances} times
            </div>
          </div>

          <div className="card">
            <h3>Actions</h3>
            <div className="actions">
              <button
                className="action-btn submit"
                onClick={handleSubmit}
              >
                Submit
              </button>
              <button
                className="action-btn reset"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <footer>
          No alerts • No penalties • Behavioral observation only
        </footer>
      </div>
    </div>
  );
}

export default CleaningGame;