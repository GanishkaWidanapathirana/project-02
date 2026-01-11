import React, { useState, useEffect } from 'react';

// Section 2 & 5: Scenarios with unsafe/safe states
const SCENARIOS = [
  { id: 'window', name: 'Window', unsafeState: 'Open', safeState: 'Closed', icon: '🪟' },
  { id: 'door', name: 'Door', unsafeState: 'Open', safeState: 'Shut', icon: '🚪' },
  { id: 'fridge', name: 'Refrigerator', unsafeState: 'Open', safeState: 'Closed', icon: '🧊' },
  { id: 'heater', name: 'Heater', unsafeState: 'On', safeState: 'Off', icon: '🔥' },
  { id: 'fan', name: 'Fan', unsafeState: 'On', safeState: 'Off', icon: '🌀' },
  { id: 'light', name: 'Light', unsafeState: 'On', safeState: 'Off', icon: '💡' },
  { id: 'stove', name: 'Gas Stove', unsafeState: 'On', safeState: 'Off', icon: '🔥' },
  { id: 'tap', name: 'Water Tap', unsafeState: 'Running', safeState: 'Closed', icon: '💧' }
];

// Section 2: Divide scenarios into multiple pages (rooms)
const PAGES = [
  {
    id: 1,
    name: 'Living Room',
    scenarios: ['window', 'door', 'light', 'fan']
  },
  {
    id: 2,
    name: 'Kitchen',
    scenarios: ['fridge', 'stove', 'tap', 'light']
  },
  {
    id: 3,
    name: 'Bedroom',
    scenarios: ['window', 'heater', 'light', 'door']
  }
];

function CheckingGame() {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemStates, setItemStates] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverStartTime, setHoverStartTime] = useState(null);
  
  // Section 4.1: Metrics Collected
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    clickCounts: {}, // Number of times each item clicked
    pageVisits: {}, // How often user returns to pages
    hoverTimes: {}, // Time spent staring at each item
    recheckDelays: {}, // Time between rechecks
    checkingSequence: [], // Sequence patterns
    revisitCount: 0, // Total revisits to already safe items
    lastClickTime: {},
    itemFirstSecured: {}
  });

  // Initialize all items as unsafe
  useEffect(() => {
    const initialStates = {};
    PAGES.forEach(page => {
      page.scenarios.forEach(scenarioId => {
        const key = `${page.id}-${scenarioId}`;
        initialStates[key] = 'unsafe';
      });
    });
    setItemStates(initialStates);
    
    // Initialize page visits
    const visits = {};
    PAGES.forEach(page => {
      visits[page.id] = 1;
    });
    setMetrics(prev => ({ ...prev, pageVisits: visits }));
  }, []);

  // Section 4.1: Track hover time (time spent staring)
  const handleMouseEnter = (itemKey) => {
    setHoveredItem(itemKey);
    setHoverStartTime(Date.now());
  };

  const handleMouseLeave = (itemKey) => {
    if (hoverStartTime) {
      const hoverDuration = Date.now() - hoverStartTime;
      setMetrics(prev => ({
        ...prev,
        hoverTimes: {
          ...prev.hoverTimes,
          [itemKey]: (prev.hoverTimes[itemKey] || 0) + hoverDuration
        }
      }));
    }
    setHoveredItem(null);
    setHoverStartTime(null);
  };

  // Section 3.1: Handle item click (corrective action)
  const handleItemClick = (itemKey, scenarioId) => {
    const currentTime = Date.now();
    const currentState = itemStates[itemKey];
    const wasAlreadySafe = currentState === 'safe';
    
    // Section 3.3: Toggle state (or keep safe if already safe)
    const newState = currentState === 'unsafe' ? 'safe' : 'safe';
    
    setItemStates(prev => ({
      ...prev,
      [itemKey]: newState
    }));

    // Section 4.1: Track clicks and rechecking behavior
    setMetrics(prev => {
      const clickCount = (prev.clickCounts[itemKey] || 0) + 1;
      const lastClick = prev.lastClickTime[itemKey];
      const recheckDelay = lastClick ? currentTime - lastClick : null;
      
      // Track if this is a revisit to already safe item
      const isRevisit = wasAlreadySafe;
      
      return {
        ...prev,
        clickCounts: {
          ...prev.clickCounts,
          [itemKey]: clickCount
        },
        checkingSequence: [...prev.checkingSequence, {
          itemKey,
          scenarioId,
          timestamp: currentTime,
          wasAlreadySafe,
          clickNumber: clickCount
        }],
        recheckDelays: recheckDelay ? {
          ...prev.recheckDelays,
          [itemKey]: [...(prev.recheckDelays[itemKey] || []), recheckDelay]
        } : prev.recheckDelays,
        lastClickTime: {
          ...prev.lastClickTime,
          [itemKey]: currentTime
        },
        revisitCount: prev.revisitCount + (isRevisit ? 1 : 0),
        itemFirstSecured: !prev.itemFirstSecured[itemKey] ? {
          ...prev.itemFirstSecured,
          [itemKey]: currentTime
        } : prev.itemFirstSecured
      };
    });
  };

  // Section 3.2: Page Navigation
  const handleNextPage = () => {
    if (currentPage < PAGES.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      trackPageVisit(PAGES[newPage].id);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      trackPageVisit(PAGES[newPage].id);
    }
  };

  // Section 4.1: Track page revisits
  const trackPageVisit = (pageId) => {
    setMetrics(prev => ({
      ...prev,
      pageVisits: {
        ...prev.pageVisits,
        [pageId]: (prev.pageVisits[pageId] || 0) + 1
      }
    }));
  };

  const handleReset = () => {
    const initialStates = {};
    PAGES.forEach(page => {
      page.scenarios.forEach(scenarioId => {
        const key = `${page.id}-${scenarioId}`;
        initialStates[key] = 'unsafe';
      });
    });
    setItemStates(initialStates);
    setCurrentPage(0);
    
    const visits = {};
    PAGES.forEach(page => {
      visits[page.id] = page.id === PAGES[0].id ? 1 : 0;
    });
    
    setMetrics({
      startTime: Date.now(),
      clickCounts: {},
      pageVisits: visits,
      hoverTimes: {},
      recheckDelays: {},
      checkingSequence: [],
      revisitCount: 0,
      lastClickTime: {},
      itemFirstSecured: {}
    });
  };

  // Generate Summary Report
  const handleSubmit = () => {
    const timeTaken = (Date.now() - metrics.startTime) / 1000;
    
    // Calculate total safe items
    const totalItems = Object.keys(itemStates).length;
    const safeItems = Object.values(itemStates).filter(state => state === 'safe').length;
    
    console.log("SENDING TO BACKEND (Checking OCD Detection):");
    alert(`Summary Report\n\nTime: ${timeTaken.toFixed(1)}s\n`);
  };

  const currentPageData = PAGES[currentPage];
  const allItemsSafe = Object.values(itemStates).every(state => state === 'safe');

  return (
    <div className="layout-container">
      <div className="app checking-app">
        <header>
          <h1>Checking & Rechecking Behavior Detection Game</h1>
          <p>Check each area of the house and make sure everything is safe. You may move between pages at any time.</p>
        </header>

        {/* Page Indicator */}
        <div className="page-indicator">
          <h2>{currentPageData.name}</h2>
          <div className="page-dots">
            {PAGES.map((page, idx) => (
              <span 
                key={page.id} 
                className={`dot ${idx === currentPage ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-grid">
          {currentPageData.scenarios.map(scenarioId => {
            const scenario = SCENARIOS.find(s => s.id === scenarioId);
            const itemKey = `${currentPageData.id}-${scenarioId}`;
            const state = itemStates[itemKey] || 'unsafe';
            const isSafe = state === 'safe';
            const clickCount = metrics.clickCounts[itemKey] || 0;
            
            return (
              <div
                key={itemKey}
                className={`item-box ${isSafe ? 'safe' : 'unsafe'} ${hoveredItem === itemKey ? 'hovered' : ''}`}
                onClick={() => handleItemClick(itemKey, scenarioId)}
                onMouseEnter={() => handleMouseEnter(itemKey)}
                onMouseLeave={() => handleMouseLeave(itemKey)}
              >
                <div className="item-icon">{scenario.icon}</div>
                <div className="item-name">{scenario.name}</div>
                <div className={`item-status ${isSafe ? 'status-safe' : 'status-unsafe'}`}>
                  {isSafe ? scenario.safeState : scenario.unsafeState}
                </div>
                {clickCount > 1 && (
                  <div className="check-count">
                    Checked {clickCount}x
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Side Panel */}
        <div className="panel">
          <div className="card">
            <h3>Navigation</h3>
            <div className="nav-buttons">
              <button
                className="nav-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                ← Previous
              </button>
              <button
                className="nav-btn"
                onClick={handleNextPage}
                disabled={currentPage === PAGES.length - 1}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Progress</h3>
            <div className="feedback">
              Page: {currentPage + 1}/{PAGES.length}<br/>
              Safe Items: {Object.values(itemStates).filter(s => s === 'safe').length}/{Object.keys(itemStates).length}<br/>
              Total Checks: {Object.values(metrics.clickCounts).reduce((sum, count) => sum + count, 0)}<br/>
              Revisits: {metrics.revisitCount}<br/>
              Time: {((Date.now() - metrics.startTime) / 1000).toFixed(0)}s
            </div>
          </div>

          <div className="card">
            <h3>Room Status</h3>
            <div className="room-list">
              {PAGES.map((page, idx) => {
                const pageItems = page.scenarios.map(sid => `${page.id}-${sid}`);
                const pageSafe = pageItems.every(key => itemStates[key] === 'safe');
                const visits = metrics.pageVisits[page.id] || 0;
                
                return (
                  <div key={page.id} className="room-item">
                    <span className={pageSafe ? 'room-safe' : 'room-unsafe'}>
                      {pageSafe ? '✓' : '•'}
                    </span>
                    {page.name}
                    {visits > 1 && <span className="visit-count">({visits}x)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3>Actions</h3>
            <div className="actions">
              <button
                className="action-btn submit"
                onClick={handleSubmit}
              >
                Summary Report
              </button>
              <button
                className="action-btn reset"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
            {allItemsSafe && (
              <div className="all-safe-message">
                ✓ All items secured!
              </div>
            )}
          </div>
        </div>

        <footer>
          Take your time • No pressure • Your behavior helps research
        </footer>
      </div>
    </div>
  );
}

export default CheckingGame;