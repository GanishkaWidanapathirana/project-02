import React, { useState, useEffect, useRef } from 'react';

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
  
  // Ref for Feature 5 (Delay before clicking)
  const pageEnterTime = useRef(Date.now());

  // Section 4.1: Metrics Collected
  const [metrics, setMetrics] = useState({
    startTime: Date.now(),
    
    // Feature 1: Total Checks
    totalChecks: 0,
    
    // Feature 2: Total Rechecks
    totalRechecks: 0,
    
    // Feature 3: Page Revisits
    uniquePagesVisited: new Set([1]), // Start on page 1
    revisitedPageCount: 0,
    
    // Feature 4: Time Taken to Secure All
    timeAllSecured: null,

    // Feature 5: Delays
    firstClickDelays: [], // List of delays in ms
    itemsClickedOnPage: new Set(), // To track first clicks per page load

    // Feature 6: Entropy (Sequence)
    checkingSequenceIds: [], // Array of item IDs in order

    // Legacy metrics for UI
    clickCounts: {}, 
    pageVisits: { 1: 1 }, 
    revisitCount: 0, 
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

  // Update page enter time when page changes (Feature 5)
  useEffect(() => {
    pageEnterTime.current = Date.now();
    setMetrics(prev => ({
        ...prev,
        itemsClickedOnPage: new Set() // Reset local tracking for delays
    }));
  }, [currentPage]);

  // Section 4.1: Track hover time
  const handleMouseEnter = (itemKey) => {
    setHoveredItem(itemKey);
    setHoverStartTime(Date.now());
  };

  const handleMouseLeave = (itemKey) => {
    setHoveredItem(null);
    setHoverStartTime(null);
  };

  // Section 3.1: Handle item click (corrective action)
  const handleItemClick = (itemKey, scenarioId) => {
    const currentTime = Date.now();
    const currentState = itemStates[itemKey];
    const isSecured = currentState === 'safe';
    
    // Feature 5: Delay before clicking unsafe items
    // If this item hasn't been clicked since entering the page, log the delay
    let currentDelay = null;
    if (!metrics.itemsClickedOnPage.has(itemKey)) {
        currentDelay = (currentTime - pageEnterTime.current) / 1000; // seconds
    }

    // Toggle state (in this game, clicking always makes it safe/keeps it safe)
    const newState = 'safe'; 
    
    const newStates = {
      ...itemStates,
      [itemKey]: newState
    };
    setItemStates(newStates);

    // Check if ALL items are now secure (Feature 4)
    const allNowSafe = Object.values(newStates).every(s => s === 'safe');
    const timeToSecure = allNowSafe ? (currentTime - metrics.startTime) / 1000 : metrics.timeAllSecured;

    // Update Metrics
    setMetrics(prev => {
      // Feature 1: Total Checks (Every click counts)
      const newTotalChecks = prev.totalChecks + 1;

      // Feature 2: Total Rechecks (Clicking something already safe)
      const newTotalRechecks = isSecured ? prev.totalRechecks + 1 : prev.totalRechecks;

      // Feature 5: Add delay if applicable
      const newDelays = currentDelay !== null 
        ? [...prev.firstClickDelays, currentDelay] 
        : prev.firstClickDelays;
      
      const newClickedSet = new Set(prev.itemsClickedOnPage);
      newClickedSet.add(itemKey);

      // Feature 6: Track Sequence
      const newSequence = [...prev.checkingSequenceIds, itemKey];

      return {
        ...prev,
        totalChecks: newTotalChecks,
        totalRechecks: newTotalRechecks,
        timeAllSecured: timeToSecure,
        firstClickDelays: newDelays,
        itemsClickedOnPage: newClickedSet,
        checkingSequenceIds: newSequence,

        // Legacy UI updates
        clickCounts: {
          ...prev.clickCounts,
          [itemKey]: (prev.clickCounts[itemKey] || 0) + 1
        },
        revisitCount: prev.revisitCount + (isSecured ? 1 : 0),
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

  // Section 4.1: Track page revisits (Feature 3)
  const trackPageVisit = (pageId) => {
    setMetrics(prev => {
        const isRevisit = prev.uniquePagesVisited.has(pageId);
        const newUnique = new Set(prev.uniquePagesVisited);
        newUnique.add(pageId);

        return {
            ...prev,
            uniquePagesVisited: newUnique,
            revisitedPageCount: isRevisit ? prev.revisitedPageCount + 1 : prev.revisitedPageCount,
            
            // Legacy UI
            pageVisits: {
                ...prev.pageVisits,
                [pageId]: (prev.pageVisits[pageId] || 0) + 1
            }
        };
    });
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
    pageEnterTime.current = Date.now();
    
    setMetrics({
      startTime: Date.now(),
      totalChecks: 0,
      totalRechecks: 0,
      uniquePagesVisited: new Set([1]),
      revisitedPageCount: 0,
      timeAllSecured: null,
      firstClickDelays: [],
      itemsClickedOnPage: new Set(),
      checkingSequenceIds: [],
      clickCounts: {},
      pageVisits: { 1: 1 },
      revisitCount: 0,
    });
  };

  // Feature 6 Helper: Calculate Entropy
  const calculateEntropy = (sequence) => {
      if (sequence.length === 0) return 0;
      
      const frequencies = {};
      sequence.forEach(id => {
          frequencies[id] = (frequencies[id] || 0) + 1;
      });

      let entropy = 0;
      const total = sequence.length;

      Object.values(frequencies).forEach(count => {
          const p = count / total;
          entropy -= p * Math.log2(p);
      });

      return entropy;
  };

  // Generate Summary Report
  const handleSubmit = () => {
    // Feature 3: Page Revisit Frequency
    const totalPages = PAGES.length; // Fixed at 3
    const pageRevisitFrequency = metrics.revisitedPageCount / totalPages;

    // Feature 5: Average Delay
    const totalDelay = metrics.firstClickDelays.reduce((a, b) => a + b, 0);
    const avgDelay = metrics.firstClickDelays.length > 0 
        ? totalDelay / metrics.firstClickDelays.length 
        : 0;

    // Feature 6: Entropy
    const entropy = calculateEntropy(metrics.checkingSequenceIds);

    // Current Time fallback for Feature 4 if not all secured
    const finalTime = (Date.now() - metrics.startTime) / 1000;
    const timeTaken = metrics.timeAllSecured || finalTime;

    const payload = {
        // 1. Total Number of Checks
        total_number_of_checks: metrics.totalChecks,

        // 2. Total Number of Rechecks
        total_number_of_rechecks: metrics.totalRechecks,

        // 3. Page Revisit Frequency
        page_revisit_frequency: parseFloat(pageRevisitFrequency.toFixed(2)),

        // 4. Time Taken to Secure All Items
        time_taken_to_secure_all_items: parseFloat(timeTaken.toFixed(2)),

        // 5. Delay Before Clicking Unsafe Items (Average)
        delay_before_clicking_unsafe_items: parseFloat(avgDelay.toFixed(2)),

        // 6. Order of Checking Entropy
        order_of_checking_entropy: parseFloat(entropy.toFixed(4))
    };

    console.log("SENDING TO BACKEND (Feature Extraction):", payload);
    alert(`Summary Report Generated!\n\nChecks: ${metrics.totalChecks}\nRechecks: ${metrics.totalRechecks}\nEntropy: ${payload.order_of_checking_entropy}\n\nCheck console for full JSON.`);
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
              Total Checks: {metrics.totalChecks}<br/>
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