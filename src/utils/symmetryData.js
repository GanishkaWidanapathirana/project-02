// Initial layout based on your HTML example
// Grid is 6x6 (rows 0-5, cols 0-5)
// Sub-grid is 0-8 steps. 4 is usually center.
export const INITIAL_PIECES = [
  { id: 1, color: 'btn-green',  boxX: 0, boxY: 0, subX: 4, subY: 4 },
  { id: 2, color: 'btn-blue',   boxX: 5, boxY: 0, subX: 4, subY: 4 },
  { id: 3, color: 'btn-yellow', boxX: 2, boxY: 1, subX: 4, subY: 4 },
  { id: 4, color: 'btn-purple', boxX: 3, boxY: 4, subX: 4, subY: 4 },
];

export const GRID_SIZE = 6;
export const SUB_GRID_STEPS = 8; // 0 to 8