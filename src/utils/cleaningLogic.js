// Game Constants
export const TILE_COUNT = 64; // 8x8 grid

// Requirement 3.1: Dirty Dots Logic
// Size 1 -> (1w, 1s) ... Size 5 -> (5w, 5s)
export const DIRT_CONFIG = [
  { size: 1, req: 1, min: 0, max: 20 },
  { size: 2, req: 2, min: 0, max: 10 },
  { size: 3, req: 3, min: 0, max: 5 },
  { size: 4, req: 4, min: 0, max: 3 },
  { size: 5, req: 5, min: 0, max: 2 },
];

// Requirement 3.3: High-Risk Logic
// Size 10->10 units, Size 50->30 units
export const CONTAMINATION_CONFIG = [
  { size: 10, req: 10 },
  { size: 20, req: 15 },
  { size: 30, req: 20 },
  { size: 40, req: 25 },
  { size: 50, req: 30 },
];

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateBoard = () => {
  // Initialize empty board
  let board = Array(TILE_COUNT).fill(null).map((_, i) => ({
    id: i,
    type: 'empty',
    size: 0,
    requiredUnits: 0, // Total Spray+Wipe pairs needed
    cleanedUnits: 0,
    sprayed: false,   // Current state (sprayed but not wiped?)
    userSprays: 0,
    userWipes: 0,
    overCleanedCount: 0,
    isClean: true
  }));

  const occupied = new Set();

  const placeItem = (index, type, size, req) => {
    board[index] = {
      ...board[index],
      type,
      size,
      requiredUnits: req,
      isClean: false
    };
    occupied.add(index);
  };

  const getFreeIndex = () => {
    let idx;
    do {
      idx = getRandomInt(0, TILE_COUNT - 1);
    } while (occupied.has(idx));
    return idx;
  };

  // 1. Place High-Risk Contamination (0-1 zones)
  if (Math.random() > 0.5) {
    const config = CONTAMINATION_CONFIG[getRandomInt(0, CONTAMINATION_CONFIG.length - 1)];
    placeItem(getFreeIndex(), 'contamination', config.size, config.req);
  }

  // 2. Place Germs (0-3 spots)
  const germCount = getRandomInt(0, 3);
  for (let i = 0; i < germCount; i++) {
    // Germs: Size 2px (visual), 1 unit cleaning
    placeItem(getFreeIndex(), 'germ', 2, 1);
  }

  // 3. Place Dirty Dots (Normal Dirt)
  DIRT_CONFIG.forEach(cfg => {
    const count = getRandomInt(cfg.min, cfg.max);
    for (let i = 0; i < count; i++) {
      if (occupied.size >= TILE_COUNT) break;
      placeItem(getFreeIndex(), 'dirt', cfg.size, cfg.req);
    }
  });

  return board;
};