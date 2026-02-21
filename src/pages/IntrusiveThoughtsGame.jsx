import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
// --- SCENARIO DATA CONSTANTS ---

// Section 3: Module 1 - Ambiguous Situations Test
const MODULE_1_SCENARIOS = [
  {
    id: 'amb-1',
    text: 'A child carrying a glass stumbles near you. What happened?',
    options: [
      { id: 'a', text: 'The child just stumbled naturally.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'I might have startled the child somehow.', severity: 1, category: 'mild-blame' },
      { id: 'c', text: 'I probably caused the child to stumble.', severity: 2, category: 'severe-blame' },
      { id: 'd', text: 'I caused harm and the child might get hurt.', severity: 3, category: 'catastrophic' }
    ]
  },
  {
    id: 'amb-2',
    text: 'You close a door and hear a soft noise afterward.',
    options: [
      { id: 'a', text: 'It was probably just the door settling.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'I might have caused something minor.', severity: 1, category: 'mild-blame' },
      { id: 'c', text: 'I may have damaged something.', severity: 2, category: 'severe-blame' },
      { id: 'd', text: 'I might have seriously harmed someone.', severity: 3, category: 'catastrophic' }
    ]
  },
  {
    id: 'amb-3',
    text: 'You place a bag on a table; someone looks in your direction.',
    options: [
      { id: 'a', text: 'They just happened to glance over.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'They might think I did something wrong.', severity: 1, category: 'mild-blame' },
      { id: 'c', text: 'I probably disturbed them somehow.', severity: 2, category: 'severe-blame' },
      { id: 'd', text: 'I must have done something inappropriate.', severity: 3, category: 'catastrophic' }
    ]
  },
  {
    id: 'amb-4',
    text: 'A friend doesn\'t reply to a message for a while.',
    options: [
      { id: 'a', text: 'They are probably busy.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'Maybe I said something slightly wrong.', severity: 1, category: 'mild-doubt' },
      { id: 'c', text: 'I probably upset them.', severity: 2, category: 'severe-doubt' },
      { id: 'd', text: 'I must have seriously offended them.', severity: 3, category: 'catastrophic' }
    ]
  },
  {
    id: 'amb-5',
    text: 'You bump into a chair; someone behind you changes direction.',
    options: [
      { id: 'a', text: 'They were going that way anyway.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'The noise might have distracted them.', severity: 1, category: 'mild-concern' },
      { id: 'c', text: 'I probably startled them.', severity: 2, category: 'severe-concern' },
      { id: 'd', text: 'I caused them to be in danger.', severity: 3, category: 'catastrophic' }
    ]
  },
  {
    id: 'amb-6',
    text: 'You place a cup and it makes a small noise.',
    options: [
      { id: 'a', text: 'Just a normal sound.', severity: 0, category: 'neutral' },
      { id: 'b', text: 'I might have placed it too hard.', severity: 1, category: 'mild-checking' },
      { id: 'c', text: 'I may have damaged the cup or table.', severity: 2, category: 'severe-checking' },
      { id: 'd', text: 'Something is definitely wrong.', severity: 3, category: 'catastrophic' }
    ]
  }
];

// Section 4: Module 2 - Moral Doubt Decision Making
const MODULE_2_SCENARIOS = [
  {
    id: 'moral-1',
    text: 'You find a wallet on the ground but don\'t pick it up.',
    options: [
      { id: 'a', text: 'Someone else will handle it.', severity: 0, category: 'normal' },
      { id: 'b', text: 'I should have picked it up.', severity: 1, category: 'mild-guilt' },
      { id: 'c', text: 'I\'m being irresponsible.', severity: 2, category: 'excessive-guilt' },
      { id: 'd', text: "I'm a bad person for not helping.", severity: 3, category: 'catastrophic-moral' }
    ]
  },
  {
    id: 'moral-2',
    text: 'You break a shared pencil and don\'t report it.',
    options: [
      { id: 'a', text: "It's just a pencil, accidents happen.", severity: 0, category: 'normal' },
      { id: 'b', text: 'I should mention it next time.', severity: 1, category: 'mild-guilt' },
      { id: 'c', text: "I'm dishonest for not saying anything.", severity: 2, category: 'excessive-guilt' },
      { id: 'd', text: "I'm a terrible person.", severity: 3, category: 'catastrophic-moral' }
    ]
  },
  {
    id: 'moral-3',
    text: 'You forget to greet a neighbor.',
    options: [
      { id: 'a', text: 'I was distracted, it happens.', severity: 0, category: 'normal' },
      { id: 'b', text: 'They might think I\'m rude.', severity: 1, category: 'mild-guilt' },
      { id: 'c', text: 'I\'m a rude person.', severity: 2, category: 'excessive-guilt' },
      { id: 'd', text: 'I hurt their feelings badly.', severity: 3, category: 'catastrophic-moral' }
    ]
  },
  {
    id: 'moral-4',
    text: 'You accidentally put a recyclable bottle in the wrong bin.',
    options: [
      { id: 'a', text: 'It\'s a small mistake.', severity: 0, category: 'normal' },
      { id: 'b', text: 'I should be more careful.', severity: 1, category: 'mild-guilt' },
      { id: 'c', text: 'I\'m harming the environment.', severity: 2, category: 'excessive-guilt' },
      { id: 'd', text: "I'm destroying the planet.", severity: 3, category: 'catastrophic-moral' }
    ]
  },
  {
    id: 'moral-5',
    text: 'You respond briefly to a friend and forget to reply again.',
    options: [
      { id: 'a', text: 'I can reply when I have time.', severity: 0, category: 'normal' },
      { id: 'b', text: 'I should have replied sooner.', severity: 1, category: 'mild-guilt' },
      { id: 'c', text: 'I\'m a bad friend.', severity: 2, category: 'excessive-guilt' },
      { id: 'd', text: "I'm neglecting them terribly.", severity: 3, category: 'catastrophic-moral' }
    ]
  }
];

// Section 5: Module 3 - Safety Analysis
const MODULE_3_SCENARIOS = [
  {
    id: 'safety-1',
    text: 'A kitchen knife is lying flat on the counter.',
    options: [
      { id: 'a', text: 'It\'s safe as long as handled properly.', severity: 0, category: 'normal' },
      { id: 'b', text: 'It could be safer in a drawer.', severity: 1, category: 'mild-threat' },
      { id: 'c', text: 'This is quite dangerous.', severity: 2, category: 'severe-threat' },
      { id: 'd', text: 'Someone will definitely get hurt.', severity: 3, category: 'catastrophic-threat' }
    ]
  },
  {
    id: 'safety-2',
    text: 'A sealed medicine bottle is on the table.',
    options: [
      { id: 'a', text: 'It\'s sealed and safe.', severity: 0, category: 'normal' },
      { id: 'b', text: 'It should be put away.', severity: 1, category: 'mild-threat' },
      { id: 'c', text: 'This is a poisoning risk.', severity: 2, category: 'severe-threat' },
      { id: 'd', text: 'Someone could die from this.', severity: 3, category: 'catastrophic-threat' }
    ]
  },
  {
    id: 'safety-3',
    text: 'An electric switch is in the OFF position.',
    options: [
      { id: 'a', text: 'It\'s off and safe.', severity: 0, category: 'normal' },
      { id: 'b', text: 'I should double-check it.', severity: 1, category: 'mild-threat' },
      { id: 'c', text: 'It might still be dangerous.', severity: 2, category: 'severe-threat' },
      { id: 'd', text: 'There could be a fire.', severity: 3, category: 'catastrophic-threat' }
    ]
  },
  {
    id: 'safety-4',
    text: 'Closed scissors are in a pencil holder.',
    options: [
      { id: 'a', text: 'They\'re closed and safe.', severity: 0, category: 'normal' },
      { id: 'b', text: 'They could be stored better.', severity: 1, category: 'mild-threat' },
      { id: 'c', text: 'This is a cutting hazard.', severity: 2, category: 'severe-threat' },
      { id: 'd', text: 'Someone will get seriously injured.', severity: 3, category: 'catastrophic-threat' }
    ]
  },
  {
    id: 'safety-5',
    text: 'A stove knob is pointed to OFF.',
    options: [
      { id: 'a', text: 'The stove is off.', severity: 0, category: 'normal' },
      { id: 'b', text: 'I should verify it\'s truly off.', severity: 1, category: 'mild-threat' },
      { id: 'c', text: 'Gas might still be leaking.', severity: 2, category: 'severe-threat' },
      { id: 'd', text: 'The house could explode.', severity: 3, category: 'catastrophic-threat' }
    ]
  }
];

// Section 6: Module 4 - Rate Unsafe Situations (0-100%)
// Note: These scenarios are actually mostly "safe" or low risk, designed to test overestimation.
const MODULE_4_SCENARIOS = [
  { id: 'rate-1', text: 'A worker is standing on a stable ladder.', type: 'slider', expectedSafe: 10 },
  { id: 'rate-2', text: 'A plug is connected normally to an outlet.', type: 'slider', expectedSafe: 0 },
  { id: 'rate-3', text: 'A man is carrying a box with one hand.', type: 'slider', expectedSafe: 15 },
  { id: 'rate-4', text: "There's a wet floor with a warning sign.", type: 'slider', expectedSafe: 20 },
  { id: 'rate-5', text: 'An electrical panel is closed and locked.', type: 'slider', expectedSafe: 0 },
  { id: 'rate-6', text: 'A worker is using gloves but no helmet.', type: 'slider', expectedSafe: 25 },
  { id: 'rate-7', text: 'A chair is blocking the walkway slightly.', type: 'slider', expectedSafe: 10 },
  { id: 'rate-8', text: 'A light bulb is flickering.', type: 'slider', expectedSafe: 5 },
  { id: 'rate-9', text: 'A box is near the edge of a table.', type: 'slider', expectedSafe: 15 },
  { id: 'rate-10', text: 'A phone charger is near a water bottle.', type: 'slider', expectedSafe: 10 }
];

const ALL_SCENARIOS = [
  ...MODULE_1_SCENARIOS.map(s => ({ ...s, module: 1, moduleName: 'Ambiguous Situations' })),
  ...MODULE_2_SCENARIOS.map(s => ({ ...s, module: 2, moduleName: 'Moral Doubt' })),
  ...MODULE_3_SCENARIOS.map(s => ({ ...s, module: 3, moduleName: 'Safety Analysis' })),
  ...MODULE_4_SCENARIOS.map(s => ({ ...s, module: 4, moduleName: 'Risk Rating' }))
];

// --- FEATURE EXTRACTION UTILITY ---
const extractGameFeatures = (finalResponses, finalTimes) => {
  const responses = Object.values(finalResponses);
  const totalResponses = responses.length;
  
  // Helpers
  const getChoiceResponses = () => responses.filter(r => r.type === 'choice');
  const getSliderResponses = () => responses.filter(r => r.type === 'rating');
  const getByModule = (modNum) => {
    // We map back to IDs to find the module, or filter ALL_SCENARIOS if available
    // Easier way: iterate ALL_SCENARIOS and grab corresponding response
    return ALL_SCENARIOS.filter(s => s.module === modNum).map(s => ({
      scenario: s,
      response: finalResponses[s.id]
    })).filter(item => item.response);
  };

  const mod1Data = getByModule(1); // Ambiguous
  const mod2Data = getByModule(2); // Moral
  const mod3Data = getByModule(3); // Safety
  const mod4Data = getByModule(4); // Risk Slider

  // --- 1. Response Choice Patterns ---
  const choiceResponses = getChoiceResponses();
  const neutralCount = choiceResponses.filter(r => r.category === 'neutral' || r.category === 'normal').length;
  const catastrophicCount = choiceResponses.filter(r => r.severity === 3).length;
  
  const responsePatterns = {
    percentNeutral: ((neutralCount / choiceResponses.length) * 100).toFixed(1),
    percentCatastrophic: ((catastrophicCount / choiceResponses.length) * 100).toFixed(1),
  };

  // --- 2. Frequency of Catastrophic Interpretations ---
  // Formula: (Number of catastrophic responses) / (Total responses)
  const catastrophicFrequency = (catastrophicCount / choiceResponses.length).toFixed(2);

  // --- 3. Degree of Self-Blame ---
  // Focus on Mod 1 (Ambiguous) & Mod 2 (Moral)
  const selfBlameRelevant = [...mod1Data, ...mod2Data];
  const selfBlameSum = selfBlameRelevant.reduce((sum, item) => sum + item.response.severity, 0);
  const meanSelfBlameScore = (selfBlameSum / selfBlameRelevant.length).toFixed(2);
  const maxSelfBlameIntensity = Math.max(...selfBlameRelevant.map(i => i.response.severity));

  // --- 4. Severity of Perceived Danger ---
  // Part A: Categorical Safety (Mod 3)
  const safetySum = mod3Data.reduce((sum, item) => sum + item.response.severity, 0);
  const avgSafetySeverity = (safetySum / mod3Data.length).toFixed(2);
  
  // Part B: Risk Rating (Mod 4 - Slider) - Deviation from "Realistic" Risk
  let overestimationTotal = 0;
  mod4Data.forEach(item => {
    const userRating = item.response.value; // 0-100
    const expectedSafe = item.scenario.expectedSafe || 10; // Default benign baseline
    // Only count if user exceeds expected (overestimation)
    if (userRating > expectedSafe) {
      overestimationTotal += (userRating - expectedSafe);
    }
  });
  const overestimationIndex = (overestimationTotal / mod4Data.length).toFixed(2); // Average points above baseline

  // --- 5. Response Time per Scenario ---
  const times = Object.values(finalTimes);
  const meanResponseTime = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(0);
  
  // Calculate Variance
  const varianceResponseTime = (times.reduce((sum, t) => sum + Math.pow(t - meanResponseTime, 2), 0) / times.length).toFixed(0);
  
  // Count delayed responses (> 5 seconds as arbitrary threshold for "rumination" in this context)
  const delayedResponseFreq = times.filter(t => t > 5000).length;

  // --- 6. Moral Guilt Sensitivity ---
  // Specific to Module 2
  const moralSum = mod2Data.reduce((sum, item) => sum + item.response.severity, 0);
  const moralGuiltScore = moralSum; // Raw sum
  const excessiveGuiltRatio = (mod2Data.filter(item => item.response.severity >= 2).length / mod2Data.length).toFixed(2);

  // --- 7. Reassurance-Seeking Patterns ---
  // Checking categories (mild-checking, mild-doubt) or specific checking text keywords
  // Categories: 'mild-checking', 'severe-checking', 'mild-doubt', 'severe-doubt'
  // Or in Safety module: options containing "check", "verify"
  let reassuranceCount = 0;
  
  [...mod1Data, ...mod3Data].forEach(item => {
    const cat = item.response.category || '';
    const txt = item.response.text || '';
    
    if (cat.includes('checking') || cat.includes('doubt')) {
      reassuranceCount++;
    } else if (item.scenario.module === 3 && (txt.includes('check') || txt.includes('verify'))) {
      // In module 3, options b usually imply checking (e.g., "I should verify it's truly off")
      reassuranceCount++;
    }
  });

  const reassuranceFrequency = reassuranceCount;

  return {
    responsePatterns,
    catastrophicFrequency,
    degreeOfSelfBlame: {
      meanScore: meanSelfBlameScore,
      maxIntensity: maxSelfBlameIntensity
    },
    perceivedDanger: {
      avgSeverityChoice: avgSafetySeverity,
      overestimationIndex: overestimationIndex, // 0-100 scale deviation
    },
    responseTimeMetrics: {
      meanTimeMs: meanResponseTime,
      varianceMs: varianceResponseTime,
      delayedResponses: delayedResponseFreq
    },
    moralGuilt: {
      totalScore: moralGuiltScore,
      excessiveGuiltRatio: excessiveGuiltRatio
    },
    reassuranceSeeking: {
      frequency: reassuranceFrequency,
      dependencyIndex: (reassuranceFrequency / (mod1Data.length + mod3Data.length)).toFixed(2)
    }
  };
};

function IntrusiveThoughtsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [showError, setShowError] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState({});
  const [scenarioStartTime, setScenarioStartTime] = useState(Date.now());
  const nav = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null); // Backend result
  const [localFeatures, setLocalFeatures] = useState(null); // Local features for reference

  const currentScenario = ALL_SCENARIOS[currentIndex];
  const progress = ((currentIndex + 1) / ALL_SCENARIOS.length) * 100;
  const isLastScenario = currentIndex === ALL_SCENARIOS.length - 1;

  useEffect(() => {
    // Only reset scenario-specific state if we are not showing results
    if (!resultData) {
      setScenarioStartTime(Date.now());
      setSelectedOption(null);
      setSliderValue(50);
      setShowError(false);
    }
  }, [currentIndex, resultData]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowError(false);
  };

  const handleSliderChange = (e) => {
    setSliderValue(parseInt(e.target.value));
  };

  const handleContinue = () => {
    const hasSelection = currentScenario.type === 'slider' || selectedOption !== null;
    
    if (!hasSelection) {
      setShowError(true);
      return;
    }

    const responseTime = Date.now() - scenarioStartTime;
    
    const response = currentScenario.type === 'slider'
      ? { value: sliderValue, type: 'rating' }
      : { ...selectedOption, type: 'choice' };

    setResponses(prev => ({
      ...prev,
      [currentScenario.id]: response
    }));

    setResponseTimes(prev => ({
      ...prev,
      [currentScenario.id]: responseTime
    }));

    if (isLastScenario) {
      // Pass the updated state directly to submit to avoid stale state issues
      const finalResponses = { ...responses, [currentScenario.id]: response };
      const finalTimes = { ...responseTimes, [currentScenario.id]: responseTime };
      handleSubmit(finalResponses, finalTimes);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async (finalResponses, finalTimes) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    setIsLoading(true);
    const token = getToken();
    // Extract deep features using the new methodology
    const derivedFeatures = extractGameFeatures(finalResponses, finalTimes);

    // Basic scoring for immediate UI feedback (kept simple for the user)
    let uiPatterns = [];
    if (parseFloat(derivedFeatures.catastrophicFrequency) > 0.2) uiPatterns.push("Tendency for Catastrophic Thinking");
    if (parseFloat(derivedFeatures.degreeOfSelfBlame.meanScore) > 1.5) uiPatterns.push("High Self-Blame");
    if (parseFloat(derivedFeatures.perceivedDanger.overestimationIndex) > 30) uiPatterns.push("Risk Overestimation");
    if (parseFloat(derivedFeatures.reassuranceSeeking.dependencyIndex) > 0.4) uiPatterns.push("Reassurance Seeking Behavior");

    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      gameName: 'Intrusive Thoughts & Cognitive Interpretation Assessment',
      timeTakenSeconds: timeTaken,
      
      // --- RAW DATA ---
      rawResponses: finalResponses,
      rawResponseTimes: finalTimes,

      // --- DERIVED BEHAVIORAL FEATURES (For ML/Analysis) ---
      features: derivedFeatures
    };

    const apiPayload = {
      game_id: 4, // Set to 4 as requested
      input_data: payload // Mapping the extracted features to input_data
    };

    console.log("SENDING TO BACKEND (Full Feature Extraction):", payload);
    
    try {
      
      // Send POST request to the backend
      const response = await fetch('/get_ocd_level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("BACKEND RESPONSE:", result);
      
      // Store result to trigger UI update
      setResultData(result);

    } catch (error) {
      console.error("Error sending data to backend:", error);
      alert("Failed to get analysis from server. Please check console.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setResponses({});
    setSelectedOption(null);
    setSliderValue(50);
    setShowError(false);
    setStartTime(Date.now());
    setResponseTimes({});
    setScenarioStartTime(Date.now());
    setResultData(null);
    setLocalFeatures(null);
  };

  // Helper to color code results
  const getColorForLabel = (label) => {
    switch(label) {
      case 'Minimal': return '#4caf50'; // Green
      case 'Mild': return '#2196f3';    // Blue
      case 'Moderate': return '#ff9800'; // Orange
      case 'Severe': return '#f44336';   // Red
      default: return '#666';
    }
  };

  if (resultData) {
    const { prediction } = resultData;
    const { label, description } = prediction;
    const labelColor = getColorForLabel(label);

    return (
      <div className="layout-container">
         <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div className="intrusive-app" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: '#333' }}>Analysis Complete</h2>
          
          {/* Result Card */}
          <div style={{ 
            border: `2px solid ${labelColor}`, 
            borderRadius: '12px', 
            padding: '24px', 
            margin: '24px 0',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#666' }}>Tendency Level</h3>
            <h1 style={{ 
              color: labelColor, 
              fontSize: '3rem', 
              margin: '10px 0',
              textTransform: 'uppercase'
            }}>
              {label}
            </h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#444' }}>
              {description}
            </p>
          </div>

          {/* Local Feature Summary */}
          <div style={{ textAlign: 'left', marginTop: '20px', fontSize: '0.9rem', color: '#555', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <strong>Key Indicators Detected:</strong>
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              <li>Catastrophic Thinking Freq: {localFeatures?.catastrophicFrequency}</li>
              <li>Reassurance Seeking: {localFeatures?.reassuranceSeeking?.frequency} instances</li>
              <li>Risk Overestimation: {localFeatures?.perceivedDanger?.overestimationIndex}</li>
            </ul>
          </div>

          <button className="continue-btn" onClick={handleReset} style={{ marginTop: '30px' }}>
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER 2: LOADING STATE ---
  if (isLoading) {
    return (
      <div className="layout-container">
         <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        <div className="intrusive-app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3', 
            borderTop: '5px solid #3498db', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <p style={{ marginTop: '20px', fontSize: '1.1rem' }}>Analyzing response patterns...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // --- RENDER 3: GAME VIEW (Default) ---
  return (
    <div className="layout-container">
       <button className="game-back-btn" onClick={() => nav('/dashboard')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
      <div className="intrusive-app">
        {/* Progress Bar */}
        <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <div className="progress-text">
            {currentIndex + 1} of {ALL_SCENARIOS.length}
          </div>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
          <strong>Module {currentScenario.module}:</strong> {currentScenario.moduleName} — Choose the option closest to your first reaction.
        </div>

        {/* Scenario Card */}
        <div className="scenario-card">
          <p className="scenario-text">{currentScenario.text}</p>

          {currentScenario.type === 'slider' ? (
            <div className="slider-container">
              <label className="slider-label">
                Rate the danger level (0% = Safe, 100% = Extremely Dangerous)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="danger-slider"
              />
              <div className="slider-value">{sliderValue}%</div>
            </div>
          ) : (
            <div className="options">
              {currentScenario.options.map((option) => (
                <button
                  key={option.id}
                  className={`option ${selectedOption?.id === option.id ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {showError && (
          <p className="error-text">
            Please choose one option to continue.
          </p>
        )}

        <div className="button-group">
          <button
            className="continue-btn"
            onClick={handleContinue}
          >
            {isLastScenario ? 'Submit Assessment' : 'Continue'}
          </button>
          
          <button
            className="reset-btn"
            onClick={handleReset}
          >
            Restart
          </button>
        </div>

        <div className="footer-info">
          No judgment • Confidential • For research purposes only
        </div>
      </div>
    </div>
  );
}

export default IntrusiveThoughtsGame;