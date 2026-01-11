import React, { useState, useEffect } from 'react';

// Constants from Game Spec (Section 2 & 3)
const GRID_SIZE = 8;

// Section 3.1: Dirty Dots (Normal Dirt)
// Sizes: [1, 2, 3, 4, 5] (1 = 1 pixel)
const DIRT_CONFIG = {
  1: { count: [0, 20], required: 1 }, // Size 1 → (1w, 1s)
  2: { count: [0, 10], required: 2 }, // Size 2 → (2w, 2s)
  3: { count: [0, 5], required: 3 },  // Size 3 → (3w, 3s)
  4: { count: [0, 3], required: 4 },  // Size 4 → (4w, 4s)
  5: { count: [0, 2], required: 5 }   // Size 5 → (5w, 5s)
};

// Section 3.2: Germ Icons (Micro-organisms)
// Size: 2 pixels, Cleaning Required: Always (1w, 1s)
const GERM_CONFIG = {
  count: [0, 3], // Possible number of spots: 0–3 (random)
  required: 1,
  size: 2
};

// Section 3.3: High-Risk Contamination Zones
// Sizes: [10, 20, 30, 40, 50] pixels
const CONTAMINATION_CONFIG = {
  10: { count: [0, 1], required: 10 }, // Size 10 → (10w, 10s)
  20: { count: [0, 1], required: 15 }, // Size 20 → (15w, 15s)
  30: { count: [0, 1], required: 20 }, // Size 30 → (20w, 20s)
  40: { count: [0, 1], required: 25 }, // Size 40 → (25w, 25s)
  50: { count: [0, 1], required: 30 }  // Size 50 → (30w, 30s)
};

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Section 2: Generate game board - tile floor divided into equal square tiles
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
    recheckCount: 0,
    firstCleanTime: null,
    lastActionTime: null,
    actionTimestamps: []
  }));

  const availableIndices = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  const usedIndices = new Set();

  // Section 3.1: Place dirt dots in random tiles
  Object.entries(DIRT_CONFIG).forEach(([size, data]) => {
    const count = randomInRange(data.count[0], data.count[1]);
    for (let i = 0; i < count; i++) {
      if (availableIndices.length === 0) return;
      
      const randomIdx = Math.floor(Math.random() * availableIndices.length);
      const tileIdx = availableIndices[randomIdx];
      
      if (!usedIndices.has(tileIdx)) {
        tiles[tileIdx] = {
          ...tiles[tileIdx],
          type: 'dirt',
          size: parseInt(size),
          requiredUnits: data.required,
          isClean: false
        };
        usedIndices.add(tileIdx);
        availableIndices.splice(randomIdx, 1);
      }
    }
  });
  
  // Section 3.2: Place germ icons
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

  // Section 3.3: Place high-risk contamination zones
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
  const [lastAction, setLastAction] = useState(null);
  
  // Section 6.1: Metrics Collected
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    totalSprays: 0,
    totalWipes: 0,
    overCleaningInstances: 0,
    tileCheckCount: {}, // Repetitive checking of tiles
    cleaningOrder: [], // Priority order
    timePerTile: {}, // Time taken for each cleaning action
    actionSequence: [], // Complete action history
    sprayWipePerDirtSpot: {} // Number of wipes and sprays used per dirt spot
  });

  useEffect(() => {
    setBoard(generateBoard());
    setMetrics(prev => ({ ...prev, startTime: Date.now() }));
  }, []);

  const currentTile = selectedIdx !== null ? board[selectedIdx] : null;

  // Section 5.1: Player clicks a tile that contains dirt
  const handleTileSelect = (index) => {
    setSelectedIdx(index);
    setActiveTool(null);
    setLastAction(null);
    
    const tile = board[index];
    
    // Section 6.1: Track repetitive checking of tiles
    setMetrics(prev => ({
      ...prev,
      tileCheckCount: {
        ...prev.tileCheckCount,
        [index]: (prev.tileCheckCount[index] || 0) + 1
      }
    }));

    // Section 6.2: Rechecking cleaned tiles - strong indicator of contamination OCD
    if (tile.isClean && tile.type !== 'empty') {
      setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        newBoard[index] = {
          ...newBoard[index],
          recheckCount: newBoard[index].recheckCount + 1
        };
        return newBoard;
      });
    }
  };

  // Section 4 & 5: Handle cleaning tools (Spray and Wiper)
  const handleToolAction = (tool) => {
    if (selectedIdx === null) return;
    
    const currentTime = Date.now();
    
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tile = { ...newBoard[selectedIdx] };

      // Track action timestamps for time analysis
      tile.actionTimestamps = [...tile.actionTimestamps, {
        tool,
        timestamp: currentTime,
        isClean: tile.isClean
      }];

      // Section 6.1: Track complete action sequence
      setMetrics(prev => ({
        ...prev,
        actionSequence: [...prev.actionSequence, {
          tileId: selectedIdx,
          tool,
          timestamp: currentTime,
          tileState: {
            type: tile.type,
            size: tile.size,
            cleanedUnits: tile.cleanedUnits,
            requiredUnits: tile.requiredUnits,
            isClean: tile.isClean
          }
        }]
      }));

      // Section 4: Cleaning unit = Select tile → Click Spray → Click Wipe = (1w, 1s)
      if (tool === 'spray') {
        tile.userSprays += 1;
        tile.sprayed = true;
        tile.lastActionTime = currentTime;
        setActiveTool('spray');
        setLastAction('spray');
        
        setMetrics(prev => ({
          ...prev,
          totalSprays: prev.totalSprays + 1
        }));

        // Section 6.1: Over-cleaning behavior - spraying already clean tile
        if (tile.isClean) {
          tile.overCleanedCount += 1;
          setMetrics(prev => ({
            ...prev,
            overCleaningInstances: prev.overCleaningInstances + 1
          }));
        }
      } 
      else if (tool === 'wipe') {
        tile.userWipes += 1;
        tile.lastActionTime = currentTime;
        setActiveTool('wipe');
        setLastAction('wipe');
        
        setMetrics(prev => ({
          ...prev,
          totalWipes: prev.totalWipes + 1
        }));

        // Section 5.2 & 5.3: Valid sequence - Spray first, then Wipe
        if (tile.sprayed && !tile.isClean) {
          // Section 5.3: Each spray + wipe counts as one unit
          tile.cleanedUnits += 1;
          tile.sprayed = false; // Reset for next cycle

          console.log(`Tile ${selectedIdx}: Cleaned ${tile.cleanedUnits}/${tile.requiredUnits} units`);

          // Section 5.4 & 5.5: Tile updates its cleanliness state
          if (tile.cleanedUnits >= tile.requiredUnits) {
            tile.isClean = true;
            tile.firstCleanTime = currentTime;
            
            console.log(`✓ Tile ${selectedIdx} (${tile.type}, size ${tile.size}) is now CLEAN! ${tile.cleanedUnits}/${tile.requiredUnits}`);
            
            // Section 6.1: Record cleaning order (priority analysis)
            setMetrics(prev => ({
              ...prev,
              cleaningOrder: [...prev.cleaningOrder, {
                tileId: selectedIdx,
                type: tile.type,
                size: tile.size,
                timestamp: currentTime,
                orderNumber: prev.cleaningOrder.length + 1,
                timeTaken: currentTime - prev.startTime
              }],
              timePerTile: {
                ...prev.timePerTile,
                [selectedIdx]: currentTime - prev.startTime
              },
              // Section 6.1: Track wipes and sprays per dirt spot
              sprayWipePerDirtSpot: {
                ...prev.sprayWipePerDirtSpot,
                [selectedIdx]: {
                  sprays: tile.userSprays,
                  wipes: tile.userWipes,
                  required: tile.requiredUnits,
                  exceeded: (tile.userSprays + tile.userWipes) > (tile.requiredUnits * 2)
                }
              }
            }));
          }
        } else if (!tile.sprayed && !tile.isClean) {
          // User wiped without spraying - invalid sequence, doesn't count
        }

        // Section 6.1: Over-cleaning - wiping already clean tile
        if (tile.isClean) {
          tile.overCleanedCount += 1;
          setMetrics(prev => ({
            ...prev,
            overCleaningInstances: prev.overCleaningInstances + 1
          }));
        }
      }

      newBoard[selectedIdx] = tile;
      return newBoard;
    });
  };

  const handleReset = () => {
    setBoard(generateBoard());
    setSelectedIdx(null);
    setActiveTool(null);
    setLastAction(null);
    setMetrics({
      startTime: Date.now(),
      totalSprays: 0,
      totalWipes: 0,
      overCleaningInstances: 0,
      tileCheckCount: {},
      cleaningOrder: [],
      timePerTile: {},
      actionSequence: [],
      sprayWipePerDirtSpot: {}
    });
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - metrics.startTime) / 1000;

    console.log("SENDING TO BACKEND (Section 8 - OCD Detection Model):");
    alert(`Cleaning Complete!\n\nTime: ${timeTaken.toFixed(1)}s\n\nCheck console for detailed metrics.`);
  };

  // Section 7.2: Render with progressive visual feedback
  const renderContent = (tile) => {
    if (tile.type === 'empty') return null;
    
    // Section 7.2: Dirt amount decreases progressively
    const progress = tile.requiredUnits > 0 ? tile.cleanedUnits / tile.requiredUnits : 1;
    const opacity = Math.max(0.15, 1 - progress);

    // Once tile is clean, dirt disappears completely
    if (tile.isClean) return null;

    if (tile.type === 'dirt') {
      // Section 3.1: Dirt sizes 1-5 pixels
      const pxSize = tile.size * 2 + 2;
      const top = 12 + (tile.id * 7 % 40);
      const left = 12 + (tile.id * 3 % 40);
      
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
      // Section 3.2: Germ icons 2 pixels
      return (
        <div 
          className="germ"
          style={{ opacity }} 
        />
      );
    }

    if (tile.type === 'contamination') {
      // Section 3.3: Contamination zones 10-50 pixels
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
  const totalTiles = dirtyCount + cleanCount;

  return (
    <div className="layout-container">
      <div className="app cleaning-app">
        {/* Section 7.1: Top - Instructions panel */}
        <header>
          <h1>Cleaning & Contamination Detection Game</h1>
          <p>Clean the tiles using spray and wiper in the way that feels necessary to you.</p>
        </header>

        {/* Section 7.1: Middle - Tile grid floor with dirt, germs, and contamination zones */}
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

        {/* Section 7.1: Right/Bottom panels */}
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

          {/* Section 7.1: Spray and Wiper tool selection buttons */}
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
            {lastAction && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                Last action: {lastAction === 'spray' ? '🧴 Sprayed' : '🧹 Wiped'}
              </div>
            )}
          </div>

          {/* Section 7.1: Feedback label - Shows required (w,s) vs. user-performed (w,s) */}
          <div className="card">
            <h3>Cleaning Status</h3>
            {currentTile ? (
              <>
                <div className="feedback">
                  Type: {currentTile.type.toUpperCase()}<br/>
                  {currentTile.size > 0 && <>Size: {currentTile.size}px<br/></>}
                  Required: ({currentTile.requiredUnits}w, {currentTile.requiredUnits}s)<br/>
                  You used: ({currentTile.userWipes}w, {currentTile.userSprays}s)<br/>
                  Progress: {currentTile.cleanedUnits}/{currentTile.requiredUnits} units
                  {currentTile.sprayed && !currentTile.isClean && (
                    <><br/><span style={{color: 'var(--warning)'}}>⏳ Waiting for wipe...</span></>
                  )}
                </div>
                
                {currentTile.isClean && currentTile.type !== 'empty' && (
                  <div className="clean-status">
                    ✓ Tile Cleaned
                  </div>
                )}

                {/* Section 7.2: Warning indicator if tile is already clean */}
                {currentTile.overCleanedCount > 0 && (
                  <div className="warning-msg">
                    ⚠️ This tile is already clean.<br/>
                    Over-cleaned: {currentTile.overCleanedCount} times.
                  </div>
                )}

                {currentTile.recheckCount > 0 && (
                  <div className="warning-msg">
                    🔄 Rechecked: {currentTile.recheckCount} times
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
              Total tiles: {totalTiles}<br/>
              Dirty: {dirtyCount} tiles<br/>
              Cleaned: {cleanCount} tiles<br/>
              Time: {((Date.now() - metrics.startTime) / 1000).toFixed(0)}s<br/>
              Over-cleaning: {metrics.overCleaningInstances} actions
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