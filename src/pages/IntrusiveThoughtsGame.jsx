import React, { useState, useEffect } from 'react';

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
const MODULE_4_SCENARIOS = [
  { id: 'rate-1', text: 'A worker is standing on a stable ladder.', type: 'slider' },
  { id: 'rate-2', text: 'A plug is connected normally to an outlet.', type: 'slider' },
  { id: 'rate-3', text: 'A man is carrying a box with one hand.', type: 'slider' },
  { id: 'rate-4', text: "There's a wet floor with a warning sign.", type: 'slider' },
  { id: 'rate-5', text: 'An electrical panel is closed and locked.', type: 'slider' },
  { id: 'rate-6', text: 'A worker is using gloves but no helmet.', type: 'slider' },
  { id: 'rate-7', text: 'A chair is blocking the walkway slightly.', type: 'slider' },
  { id: 'rate-8', text: 'A light bulb is flickering.', type: 'slider' },
  { id: 'rate-9', text: 'A box is near the edge of a table.', type: 'slider' },
  { id: 'rate-10', text: 'A phone charger is near a water bottle.', type: 'slider' }
];

const ALL_SCENARIOS = [
  ...MODULE_1_SCENARIOS.map(s => ({ ...s, module: 1, moduleName: 'Ambiguous Situations' })),
  ...MODULE_2_SCENARIOS.map(s => ({ ...s, module: 2, moduleName: 'Moral Doubt' })),
  ...MODULE_3_SCENARIOS.map(s => ({ ...s, module: 3, moduleName: 'Safety Analysis' })),
  ...MODULE_4_SCENARIOS.map(s => ({ ...s, module: 4, moduleName: 'Risk Rating' }))
];

function IntrusiveThoughtsGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [sliderValue, setSliderValue] = useState(50);
  const [showError, setShowError] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState({});
  const [scenarioStartTime, setScenarioStartTime] = useState(Date.now());

  const currentScenario = ALL_SCENARIOS[currentIndex];
  const progress = ((currentIndex + 1) / ALL_SCENARIOS.length) * 100;
  const isLastScenario = currentIndex === ALL_SCENARIOS.length - 1;

  useEffect(() => {
    setScenarioStartTime(Date.now());
    setSelectedOption(null);
    setSliderValue(50);
    setShowError(false);
  }, [currentIndex]);

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
      handleSubmit({
        ...responses,
        [currentScenario.id]: response
      }, {
        ...responseTimes,
        [currentScenario.id]: responseTime
      });
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = (finalResponses, finalTimes) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    
    // Section 8: Calculate cognitive distortion scores
    const module1Responses = MODULE_1_SCENARIOS.map(s => finalResponses[s.id]).filter(Boolean);
    const module2Responses = MODULE_2_SCENARIOS.map(s => finalResponses[s.id]).filter(Boolean);
    const module3Responses = MODULE_3_SCENARIOS.map(s => finalResponses[s.id]).filter(Boolean);
    const module4Responses = MODULE_4_SCENARIOS.map(s => finalResponses[s.id]).filter(Boolean);

    // Calculate severity scores
    const avgSeverityM1 = module1Responses.reduce((sum, r) => sum + (r.severity || 0), 0) / module1Responses.length;
    const avgSeverityM2 = module2Responses.reduce((sum, r) => sum + (r.severity || 0), 0) / module2Responses.length;
    const avgSeverityM3 = module3Responses.reduce((sum, r) => sum + (r.severity || 0), 0) / module3Responses.length;
    const avgRiskRating = module4Responses.reduce((sum, r) => sum + (r.value || 0), 0) / module4Responses.length;

    // Count catastrophic responses
    const catastrophicCount = [...module1Responses, ...module2Responses, ...module3Responses]
      .filter(r => r.severity === 3).length;

    // Calculate OCD cognitive distortion score
    let ocdScore = 0;
    let patterns = [];

    // Self-blame and misinterpretation (Module 1)
    if (avgSeverityM1 > 2) {
      ocdScore += 3;
      patterns.push('Severe self-blame and misinterpretation');
    } else if (avgSeverityM1 > 1.5) {
      ocdScore += 2;
      patterns.push('Moderate self-blame tendencies');
    } else if (avgSeverityM1 > 0.8) {
      ocdScore += 1;
      patterns.push('Mild self-doubt');
    }

    // Moral scrupulosity (Module 2)
    if (avgSeverityM2 > 2) {
      ocdScore += 3;
      patterns.push('Severe moral scrupulosity');
    } else if (avgSeverityM2 > 1.5) {
      ocdScore += 2;
      patterns.push('Excessive guilt patterns');
    } else if (avgSeverityM2 > 0.8) {
      ocdScore += 1;
      patterns.push('Mild moral concern');
    }

    // Exaggerated threat perception (Module 3)
    if (avgSeverityM3 > 2) {
      ocdScore += 2;
      patterns.push('Severe threat exaggeration');
    } else if (avgSeverityM3 > 1.5) {
      ocdScore += 1;
      patterns.push('Moderate threat perception');
    }

    // Risk miscalibration (Module 4)
    if (avgRiskRating > 70) {
      ocdScore += 2;
      patterns.push('Severe risk overestimation');
    } else if (avgRiskRating > 50) {
      ocdScore += 1;
      patterns.push('Moderate risk inflation');
    }

    // Catastrophic thinking
    if (catastrophicCount > 5) {
      ocdScore += 2;
      patterns.push('Frequent catastrophic thinking');
    } else if (catastrophicCount > 2) {
      ocdScore += 1;
    }

    const behaviorPattern = ocdScore >= 8 ? 'High OCD cognitive distortion patterns'
      : ocdScore >= 5 ? 'Moderate cognitive distortion tendencies'
      : ocdScore >= 3 ? 'Mild intrusive thought patterns'
      : 'Normal cognitive interpretation';

    const payload = {
      sessionId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      gameName: 'Intrusive Thoughts & Cognitive Interpretation Assessment',
      timeTakenSeconds: timeTaken,
      behaviorPattern,
      ocdScore,
      detectedPatterns: patterns,
      
      moduleScores: {
        ambiguousSituations: {
          avgSeverity: avgSeverityM1.toFixed(2),
          responses: module1Responses
        },
        moralDoubt: {
          avgSeverity: avgSeverityM2.toFixed(2),
          responses: module2Responses
        },
        safetyAnalysis: {
          avgSeverity: avgSeverityM3.toFixed(2),
          responses: module3Responses
        },
        riskRating: {
          avgRating: avgRiskRating.toFixed(2),
          responses: module4Responses
        }
      },
      
      detailedMetrics: {
        catastrophicResponses: catastrophicCount,
        totalResponses: ALL_SCENARIOS.length,
        averageResponseTime: Object.values(finalTimes).reduce((sum, t) => sum + t, 0) / Object.values(finalTimes).length,
        responseTimes: finalTimes
      },
      
      allResponses: finalResponses
    };

    console.log("SENDING TO BACKEND (Cognitive OCD Detection):", payload);
    alert(`Assessment Complete!\n\nTime: ${timeTaken.toFixed(1)}s\nPattern: ${behaviorPattern}\nOCD Score: ${ocdScore}/12\n\nDetected Patterns:\n${patterns.join('\n') || 'Normal responses'}`);
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
  };

  return (
    <div className="layout-container">
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