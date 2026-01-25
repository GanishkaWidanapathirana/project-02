import React, { useState, useEffect, useRef } from 'react';

// Constants from Game Spec (Section 2 & 3)
const GRID_SIZE = 8;

// Section 3.1: Dirty Dots (Normal Dirt)
const DIRT_CONFIG = {
  1: { count: [0, 20], required: 1 }, 
  2: { count: [0, 10], required: 2 }, 
  3: { count: [0, 5], required: 3 },  
  4: { count: [0, 3], required: 4 },  
  5: { count: [0, 2], required: 5 }   
};

// Section 3.2: Germ Icons
const GERM_CONFIG = {
  count: [0, 3],
  required: 1,
  size: 2
};

// Section 3.3: High-Risk Contamination Zones
const CONTAMINATION_CONFIG = {
  10: { count: [0, 1], required: 10 },
  20: { count: [0, 1], required: 15 }, 
  30: { count: [0, 1], required: 20 }, 
  40: { count: [0, 1], required: 25 }, 
  50: { count: [0, 1], required: 30 }  
};

const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Section 2: Generate game board
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

  // Place dirt
  Object.entries(DIRT_CONFIG).forEach(([size, data]) => {
    const count = randomInRange(data.count[0], data.count[1]);
    for (let i = 0; i < count; i++) {
      if (availableIndices.length === 0) return;
      const randomIdx = Math.floor(Math.random() * availableIndices.length);
      const tileIdx = availableIndices[randomIdx];
      if (!usedIndices.has(tileIdx)) {
        tiles[tileIdx] = { ...tiles[tileIdx], type: 'dirt', size: parseInt(size), requiredUnits: data.required, isClean: false };
        usedIndices.add(tileIdx);
        availableIndices.splice(randomIdx, 1);
      }
    }
  });
  
  // Place germs
  const germCount = randomInRange(GERM_CONFIG.count[0], GERM_CONFIG.count[1]);
  for (let i = 0; i < germCount; i++) {
    if (availableIndices.length === 0) break;
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    const tileIdx = availableIndices[randomIdx];
    tiles[tileIdx] = { ...tiles[tileIdx], type: 'germ', size: GERM_CONFIG.size, requiredUnits: GERM_CONFIG.required, isClean: false };
    usedIndices.add(tileIdx);
    availableIndices.splice(randomIdx, 1);
  }

  // Place contamination
  const contaminationSizes = [10, 20, 30, 40, 50];
  const selectedSize = contaminationSizes[Math.floor(Math.random() * contaminationSizes.length)];
  const contConfig = CONTAMINATION_CONFIG[selectedSize];
  const contCount = randomInRange(contConfig.count[0], contConfig.count[1]);
  for (let i = 0; i < contCount; i++) {
    if (availableIndices.length === 0) break;
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    const tileIdx = availableIndices[randomIdx];
    tiles[tileIdx] = { ...tiles[tileIdx], type: 'contamination', size: selectedSize, requiredUnits: contConfig.required, isClean: false };
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
  
  // Refs for accurate timing calculations (Feature 10)
  const lastInteractionTime = useRef(Date.now());
  const activeTileType = useRef('empty');

  // Section 6.1: Metrics Collected
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    totalSprays: 0, // Feature 4
    totalWipes: 0,  // Feature 5
    overCleaningInstances: 0,
    tileCheckCount: {},
    cleaningOrder: [],
    timePerTile: {}, 
    actionSequence: [],
    sprayWipePerDirtSpot: {},
    
    // NEW METRICS FOR FEATURE EXTRACTION
    toolSwitchCount: 0, // Feature 6
    repeatActionsAfterCompletion: 0, // Feature 8
    timeSpentByType: { // Feature 10 (Time accumulation)
      dirt: 0,
      germ: 0,
      contamination: 0,
      empty: 0
    }
  });

  useEffect(() => {
    setBoard(generateBoard());
    setMetrics(prev => ({ ...prev, startTime: Date.now() }));
    lastInteractionTime.current = Date.now();
  }, []);

  const currentTile = selectedIdx !== null ? board[selectedIdx] : null;

  // Helper to accumulate time spent on specific tile types (Feature 10)
  const trackTimeSpent = (newTileType) => {
    const now = Date.now();
    const duration = (now - lastInteractionTime.current) / 1000; // seconds
    const previousType = activeTileType.current;

    setMetrics(prev => ({
      ...prev,
      timeSpentByType: {
        ...prev.timeSpentByType,
        [previousType]: (prev.timeSpentByType[previousType] || 0) + duration
      }
    }));

    lastInteractionTime.current = now;
    activeTileType.current = newTileType || 'empty';
  };

  // Section 5.1: Player clicks a tile
  const handleTileSelect = (index) => {
    const tile = board[index];
    trackTimeSpent(tile.type); // Feature 10 tracking

    setSelectedIdx(index);
    setActiveTool(null);
    setLastAction(null);
    
    setMetrics(prev => ({
      ...prev,
      tileCheckCount: {
        ...prev.tileCheckCount,
        [index]: (prev.tileCheckCount[index] || 0) + 1
      }
    }));

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

  // Section 4 & 5: Handle cleaning tools
  const handleToolAction = (tool) => {
    if (selectedIdx === null) return;
    
    const tileType = board[selectedIdx].type;
    trackTimeSpent(tileType); // Update time spent logic

    const currentTime = Date.now();
    
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      const tile = { ...newBoard[selectedIdx] };

      tile.actionTimestamps = [...tile.actionTimestamps, {
        tool,
        timestamp: currentTime,
        isClean: tile.isClean
      }];

      setMetrics(prev => {
        // Feature 6: Tool Switch Frequency
        let switchCount = prev.toolSwitchCount;
        if (lastAction && lastAction !== tool) {
            switchCount += 1;
        }

        // Feature 8: Repeat actions after completion
        let repeatCount = prev.repeatActionsAfterCompletion;
        if (tile.isClean) {
            repeatCount += 1;
        }

        return {
          ...prev,
          toolSwitchCount: switchCount,
          repeatActionsAfterCompletion: repeatCount,
          actionSequence: [...prev.actionSequence, {
            tileId: selectedIdx,
            tool,
            timestamp: currentTime,
            tileState: { ...tile }
          }]
        };
      });

      if (tool === 'spray') {
        tile.userSprays += 1;
        tile.sprayed = true;
        tile.lastActionTime = currentTime;
        setActiveTool('spray');
        setLastAction('spray');
        
        setMetrics(prev => ({ ...prev, totalSprays: prev.totalSprays + 1 })); // Feature 4

        if (tile.isClean) {
          tile.overCleanedCount += 1;
          setMetrics(prev => ({ ...prev, overCleaningInstances: prev.overCleaningInstances + 1 }));
        }
      } 
      else if (tool === 'wipe') {
        tile.userWipes += 1;
        tile.lastActionTime = currentTime;
        setActiveTool('wipe');
        setLastAction('wipe');
        
        setMetrics(prev => ({ ...prev, totalWipes: prev.totalWipes + 1 })); // Feature 5

        if (tile.sprayed && !tile.isClean) {
          tile.cleanedUnits += 1;
          tile.sprayed = false;

          if (tile.cleanedUnits >= tile.requiredUnits) {
            tile.isClean = true;
            tile.firstCleanTime = currentTime;
            
            setMetrics(prev => ({
              ...prev,
              cleaningOrder: [...prev.cleaningOrder, {
                tileId: selectedIdx,
                type: tile.type,
                timestamp: currentTime,
                orderNumber: prev.cleaningOrder.length + 1
              }]
            }));
          }
        }

        if (tile.isClean) {
          tile.overCleanedCount += 1;
          setMetrics(prev => ({ ...prev, overCleaningInstances: prev.overCleaningInstances + 1 }));
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
    lastInteractionTime.current = Date.now();
    activeTileType.current = 'empty';
    
    setMetrics({
      startTime: Date.now(),
      totalSprays: 0,
      totalWipes: 0,
      overCleaningInstances: 0,
      tileCheckCount: {},
      cleaningOrder: [],
      timePerTile: {},
      actionSequence: [],
      sprayWipePerDirtSpot: {},
      toolSwitchCount: 0,
      repeatActionsAfterCompletion: 0,
      timeSpentByType: { dirt: 0, germ: 0, contamination: 0, empty: 0 }
    });
  };

  const handleSubmit = () => {
    // Flush final time buffer
    trackTimeSpent(null); 

    const endTime = Date.now();
    const totalTime = (endTime - metrics.startTime) / 1000;
    const totalTimeMinutes = totalTime / 60;

    // Helper: Calculate Accuracy Ratios (Features 1, 2, 3)
    const calculateAccuracy = (type) => {
        const tilesOfType = board.filter(t => t.type === type);
        if (tilesOfType.length === 0) return 0;

        let totalPerformed = 0;
        let totalRequired = 0;

        tilesOfType.forEach(t => {
            // Note: 1 unit = 1 spray + 1 wipe. 
            // Performed units = (sprays + wipes) / 2 to normalize against required units
            // Or strictly using cleanedUnits if we only care about success
            // However, definition implies "over-cleaning" (>1.0), so we use inputs:
            totalPerformed += (t.userSprays + t.userWipes) / 2;
            totalRequired += t.requiredUnits;
        });

        return totalRequired > 0 ? (totalPerformed / totalRequired).toFixed(2) : 0;
    };

    // Feature 9: Over-cleaning frequency
    const tilesInteracted = board.filter(t => t.userSprays > 0 || t.userWipes > 0);
    const overCleanedTiles = tilesInteracted.filter(t => {
        // Did they perform more actions than strictly required?
        const performedUnits = (t.userSprays + t.userWipes) / 2;
        return performedUnits > t.requiredUnits;
    }).length;
    
    const overCleaningFreq = tilesInteracted.length > 0 
        ? (overCleanedTiles / tilesInteracted.length).toFixed(2) 
        : 0;

    // Feature 10: High Risk Obsession Intensity
    const highRiskTime = metrics.timeSpentByType.contamination || 0;
    // Total cleaning time (sum of all valid tile interactions, excluding empty)
    const validCleaningTime = metrics.timeSpentByType.dirt + metrics.timeSpentByType.germ + metrics.timeSpentByType.contamination;
    const obsessionIntensity = validCleaningTime > 0 
        ? (highRiskTime / validCleaningTime).toFixed(2) 
        : 0;

    const payload = {
        // 1. Normal Dirt Cleaning Accuracy
        normal_dirt_cleaning_accuracy: calculateAccuracy('dirt'),

        // 2. Germ Cleaning Accuracy
        germ_cleaning_accuracy: calculateAccuracy('germ'),

        // 3. High-Risk Zone Cleaning Accuracy
        high_risk_zone_cleaning_accuracy: calculateAccuracy('contamination'),

        // 4. Spray Usage Count
        spray_usage_count: metrics.totalSprays,

        // 5. Wipe Usage Count
        wipe_usage_count: metrics.totalWipes,

        // 6. Tool Switch Frequency (per minute)
        tool_switch_frequency: totalTimeMinutes > 0 
            ? (metrics.toolSwitchCount / totalTimeMinutes).toFixed(2) 
            : 0,

        // 7. Time to Complete Cleaning
        time_to_complete_cleaning: totalTime.toFixed(2),

        // 8. Repeat Actions After Completion
        repeat_actions_after_completion: metrics.repeatActionsAfterCompletion,

        // 9. Over-cleaning Frequency
        over_cleaning_frequency: overCleaningFreq,

        // 10. High-Risk Area Obsession Intensity
        high_risk_area_obsession_intensity: obsessionIntensity
    };

    console.log("SENDING TO BACKEND (Feature Extraction):", payload);
    alert(`Cleaning Complete!\n\nTime: ${totalTime.toFixed(1)}s\nCheck console for extracted features.`);
  };

  const renderContent = (tile) => {
    if (tile.type === 'empty') return null;
    const progress = tile.requiredUnits > 0 ? tile.cleanedUnits / tile.requiredUnits : 1;
    const opacity = Math.max(0.15, 1 - progress);
    if (tile.isClean) return null;

    if (tile.type === 'dirt') {
      const pxSize = tile.size * 2 + 2;
      const top = 12 + (tile.id * 7 % 40);
      const left = 12 + (tile.id * 3 % 40);
      return <div className="dirt" style={{ width: `${pxSize}px`, height: `${pxSize}px`, top: `${top}px`, left: `${left}px`, opacity }} />;
    }
    if (tile.type === 'germ') {
      return <div className="germ" style={{ opacity }} />;
    }
    if (tile.type === 'contamination') {
      return <div className="contamination" style={{ width: `${tile.size}px`, height: `${tile.size}px`, opacity: opacity * 0.85 }} />;
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