// gameLogic.js - Core Connect 4 logic

// Constants
export const ROWS = 6;
export const COLS = 7;
export const EMPTY = null;
export const PLAYER_1 = 1;
export const PLAYER_2 = 2;

/**
 * Create an empty game board
 * @returns {Array<Array<null>>} Empty board
 */
export function createEmptyBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY));
}

/**
 * Find the lowest empty row in a column
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} colIndex - Column index
 * @returns {number} Row index or -1 if column is full
 */
export function findLowestEmptyRow(board, colIndex) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][colIndex] === EMPTY) {
      return row;
    }
  }
  return -1; // Column is full
}

/**
 * Check if the board is full (draw condition)
 * @param {Array<Array<null|number>>} board - Current game board
 * @returns {boolean} True if board is full
 */
export function isBoardFull(board) {
  return board[0].every(cell => cell !== EMPTY);
}

/**
 * Make a move on the board
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} colIndex - Column to make move
 * @param {number} player - Player making the move
 * @returns {Object} New board and row where piece was placed, or null if invalid
 */
export function makeMove(board, colIndex, player) {
  // Create a copy of the board
  const newBoard = board.map(row => [...row]);
  const rowIndex = findLowestEmptyRow(board, colIndex);
  
  // Invalid move (column is full)
  if (rowIndex === -1) {
    return { board: newBoard, rowIndex: null };
  }
  
  // Make the move
  newBoard[rowIndex][colIndex] = player;
  return { board: newBoard, rowIndex };
}

/**
 * Check for a win in a specific direction
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} row - Row of last move
 * @param {number} col - Column of last move
 * @param {Object} direction - Direction to check
 * @param {number} player - Player to check for win
 * @returns {Object} Result including win status and winning cells
 */
export function checkDirection(board, row, col, direction, player) {
  const winningCells = [];
  const oppositeDirection = { row: -direction.row, col: -direction.col };
  
  // Check in the positive direction
  let count = 0;
  let r = row;
  let c = col;
  
  while (
    r >= 0 && r < ROWS &&
    c >= 0 && c < COLS &&
    board[r][c] === player
  ) {
    winningCells.push({ row: r, col: c });
    count++;
    r += direction.row;
    c += direction.col;
  }
  
  // Check in the negative direction
  r = row + oppositeDirection.row;
  c = col + oppositeDirection.col;
  
  while (
    r >= 0 && r < ROWS &&
    c >= 0 && c < COLS &&
    board[r][c] === player
  ) {
    winningCells.push({ row: r, col: c });
    count++;
    r += oppositeDirection.row;
    c += oppositeDirection.col;
  }
  
  return {
    win: count >= 4,
    winningCells: count >= 4 ? winningCells : []
  };
}

/**
 * Check if the last move resulted in a win
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} rowIndex - Row of last move
 * @param {number} colIndex - Column of last move
 * @returns {Object} Win result with status and winning cells
 */
export function checkWin(board, rowIndex, colIndex) {
  const directions = [
    { row: 0, col: 1 },  // horizontal
    { row: 1, col: 0 },  // vertical
    { row: 1, col: 1 },  // diagonal down-right
    { row: 1, col: -1 }, // diagonal down-left
  ];
  
  const player = board[rowIndex][colIndex];
  
  for (const direction of directions) {
    const result = checkDirection(board, rowIndex, colIndex, direction, player);
    if (result.win) return result;
  }
  
  return { win: false, winningCells: [] };
}

/**
 * Get the current game status
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} lastRow - Row of last move
 * @param {number} lastCol - Column of last move
 * @returns {Object} Game status (inProgress, win, or draw) and details
 */
export function getGameStatus(board, lastRow, lastCol) {
  if (lastRow === null || lastCol === null) {
    return { 
      status: 'inProgress',
      winner: null,
      winningCells: []
    };
  }
  
  const winResult = checkWin(board, lastRow, lastCol);
  if (winResult.win) {
    return {
      status: 'win',
      winner: board[lastRow][lastCol],
      winningCells: winResult.winningCells
    };
  }
  
  if (isBoardFull(board)) {
    return {
      status: 'draw',
      winner: null,
      winningCells: []
    };
  }
  
  return {
    status: 'inProgress',
    winner: null,
    winningCells: []
  };
}

/**
 * Check if a move is valid
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} colIndex - Column to check
 * @returns {boolean} True if move is valid
 */
export function isValidMove(board, colIndex) {
  // Check if column is within bounds
  if (colIndex < 0 || colIndex >= COLS) {
    return false;
  }
  
  // Check if column is not full
  return findLowestEmptyRow(board, colIndex) !== -1;
}

/**
 * Get all valid moves
 * @param {Array<Array<null|number>>} board - Current game board
 * @returns {Array<number>} Array of valid column indices
 */
export function getValidMoves(board) {
  return Array(COLS).fill()
    .map((_, i) => i)
    .filter(colIndex => isValidMove(board, colIndex));
}
