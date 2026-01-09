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
    recheckCount: 0,
    firstCleanTime: null,
    lastActionTime: null
  }));

  const availableIndices = [...Array(GRID_SIZE * GRID_SIZE).keys()];
  const usedIndices = new Set();

  // Place dirt dots (Section 3.1)
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
  
  // Place germs (Section 3.2)
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

  // Place contamination zones (Section 3.3)
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
  
  // Metrics for OCD Detection (Section 6.1)
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    totalSprays: 0,
    totalWipes: 0,
    overCleaningInstances: 0,
    tileCheckCount: {},
    cleaningOrder: [],
    timePerTile: {},
    actionSequence: []
  });

  // Initialize Game
  useEffect(() => {
    setBoard(generateBoard());
    setMetrics(prev => ({ ...prev, startTime: Date.now() }));
  }, []);

  const currentTile = selectedIdx !== null ? board[selectedIdx] : null;

  // Track tile selection for rechecking behavior (Section 6.1)
  const handleTileSelect = (index) => {
    const previousIdx = selectedIdx;
    setSelectedIdx(index);
    setActiveTool(null);
    setLastAction(null);
    
    const tile = board[index];
    
    setMetrics(prev => ({
      ...prev,
      tileCheckCount: {
        ...prev.tileCheckCount,
        [index]: (prev.tileCheckCount[index] || 0) + 1
      }
    }));

    // Track if user is rechecking already clean tiles (Section 6.2)
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

  // Handle cleaning actions following Section 4 & 5 flow
  const handleToolAction = (tool) => {
    if (selectedIdx === null) return;
    
    const currentTime = Date.now();
    
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tile = { ...newBoard[selectedIdx] };

      // Track action sequence for behavioral analysis
      setMetrics(prev => ({
        ...prev,
        actionSequence: [...prev.actionSequence, {
          tileId: selectedIdx,
          tool,
          timestamp: currentTime,
          tileState: {
            type: tile.type,
            cleanedUnits: tile.cleanedUnits,
            requiredUnits: tile.requiredUnits,
            isClean: tile.isClean
          }
        }]
      }));

      // Section 4: Cleaning unit = Spray → Wipe
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

        // Detect over-cleaning: spraying already clean tile (Section 6.1)
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

        // Section 5: Valid cleaning sequence - Spray must come before Wipe
        if (tile.sprayed && !tile.isClean) {
          // Complete one cleaning unit (1w, 1s)
          tile.cleanedUnits += 1;
          tile.sprayed = false; // Reset for next cycle

          // Section 5.4: Check if tile is now fully clean
          if (tile.cleanedUnits >= tile.requiredUnits) {
            tile.isClean = true;
            tile.firstCleanTime = currentTime;
            
            setMetrics(prev => ({
              ...prev,
              cleaningOrder: [...prev.cleaningOrder, {
                tileId: selectedIdx,
                type: tile.type,
                size: tile.size,
                timestamp: currentTime,
                orderNumber: prev.cleaningOrder.length + 1
              }],
              timePerTile: {
                ...prev.timePerTile,
                [selectedIdx]: currentTime - prev.startTime
              }
            }));
          }
        } else if (!tile.sprayed && !tile.isClean) {
          // User wiped without spraying first - invalid sequence
          // This doesn't count as a cleaning unit
        }

        // Detect over-cleaning: wiping already clean tile (Section 6.1)
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
      actionSequence: []
    });
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - metrics.startTime) / 1000;
    const cleanedTiles = board.filter(t => t.isClean && t.type !== 'empty');
    const dirtyTiles = board.filter(t => !t.isClean && t.type !== 'empty');
    
    // Section 6.2: Calculate OCD scoring metrics
    const totalRequired = board.reduce((sum, t) => sum + t.requiredUnits, 0);
    const totalUsed = metrics.totalSprays + metrics.totalWipes;
    const expectedActions = totalRequired * 2; // Each unit needs 1 spray + 1 wipe
    
    // Efficiency score calculation
    let behaviorScore = 'Normal';
    if (totalUsed === expectedActions) {
      behaviorScore = 'Efficient - Exactly required';
    } else if (totalUsed > expectedActions) {
      const overCleaningRatio = ((totalUsed - expectedActions) / expectedActions) * 100;
      if (overCleaningRatio > 50) {
        behaviorScore = 'High OCD tendency - Excessive over-cleaning';
      } else if (overCleaningRatio > 20) {
        behaviorScore = 'Moderate over-cleaning';
      } else {
        behaviorScore = 'Slight over-cleaning';
      }
    } else if (totalUsed < expectedActions) {
      behaviorScore = 'Under-cleaning - Low completion';
    }

    // Analyze cleaning priority (Section 6.1)
    const priorityAnalysis = analyzePriority(metrics.cleaningOrder);
    
    // Analyze rechecking behavior
    const recheckingBehavior = board
      .filter(t => t.recheckCount > 0)
      .map(t => ({
        tileId: t.id,
        type: t.type,
        recheckCount: t.recheckCount
      }));

    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      timeTakenSeconds: timeTaken,
      behaviorScore,
      metrics: {
        totalSprays: metrics.totalSprays,
        totalWipes: metrics.totalWipes,
        totalRequired: expectedActions,
        totalUsed,
        cleanedTiles: cleanedTiles.length,
        dirtyTiles: dirtyTiles.length,
        overCleaningInstances: metrics.overCleaningInstances,
        efficiencyScore: expectedActions > 0 ? (expectedActions / totalUsed * 100).toFixed(2) + '%' : '100%',
        priorityAnalysis,
        recheckingBehavior,
        tileCheckCount: metrics.tileCheckCount
      },
      cleaningOrder: metrics.cleaningOrder,
      actionSequence: metrics.actionSequence,
      finalBoard: board.map(t => ({
        id: t.id,
        type: t.type,
        size: t.size,
        requiredUnits: t.requiredUnits,
        cleanedUnits: t.cleanedUnits,
        userSprays: t.userSprays,
        userWipes: t.userWipes,
        isClean: t.isClean,
        overCleanedCount: t.overCleanedCount,
        recheckCount: t.recheckCount
      }))
    };

    console.log("SENDING TO BACKEND (Section 8):", payload);
    alert(`Cleaning Complete!\n\nTime: ${timeTaken.toFixed(1)}s\nCleaned: ${cleanedTiles.length}/${cleanedTiles.length + dirtyTiles.length} tiles\nBehavior: ${behaviorScore}\nOver-cleaning: ${metrics.overCleaningInstances} times\nEfficiency: ${payload.metrics.efficiencyScore}`);
  };

  // Section 6.1: Analyze priority order (germs first, contamination priority, etc.)
  const analyzePriority = (cleaningOrder) => {
    if (cleaningOrder.length === 0) return 'No tiles cleaned';
    
    const firstCleaned = cleaningOrder[0];
    const priorities = {
      germ: cleaningOrder.filter(t => t.type === 'germ').length,
      contamination: cleaningOrder.filter(t => t.type === 'contamination').length,
      dirt: cleaningOrder.filter(t => t.type === 'dirt').length
    };

    let priority = 'Mixed priority';
    if (firstCleaned.type === 'germ') {
      priority = 'Germ-focused (high contamination concern)';
    } else if (firstCleaned.type === 'contamination') {
      priority = 'High-risk zone priority';
    } else {
      priority = 'Dirt-focused (normal cleaning pattern)';
    }

    return {
      firstCleanedType: firstCleaned.type,
      priorityPattern: priority,
      distribution: priorities
    };
  };

  // Render dirt/germ/contamination visuals with progressive cleaning
  const renderContent = (tile) => {
    if (tile.type === 'empty') return null;
    
    // Section 5.4: Visual feedback - dirt decreases progressively
    const progress = tile.requiredUnits > 0 ? tile.cleanedUnits / tile.requiredUnits : 1;
    const opacity = Math.max(0.1, 1 - progress);

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
            {lastAction && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-soft)' }}>
                Last action: {lastAction === 'spray' ? '🧴 Sprayed' : '🧹 Wiped'}
              </div>
            )}
          </div>

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