// aiPlayer.js - AI logic for Connect 4 game
import {
  COLS,
  ROWS,
  EMPTY,
  PLAYER_1,
  PLAYER_2,
  getValidMoves,
  makeMove,
  checkWin,
  isValidMove
} from './gameLogic';

/**
 * AI personas with associated difficulty levels
 */
export const AI_LEVEL = {
  JIM: 'easy',     // Jim - Easy difficulty
  ROSIE: 'medium',  // Rosie - Medium difficulty
  DANGERMOUSE: 'hard'  // Dangermouse - Hard difficulty
};

/**
 * AI persona descriptions
 */
export const AI_PERSONA = {
  [AI_LEVEL.JIM]: {
    name: 'Jim',
    description: 'Casual player who often makes random moves',
    avatar: '👨‍💼'
  },
  [AI_LEVEL.ROSIE]: {
    name: 'Rosie',
    description: 'Strategic player who can spot obvious opportunities',
    avatar: '👩‍🔬'
  },
  [AI_LEVEL.DANGERMOUSE]: {
    name: 'Dangermouse',
    description: 'Master tactician who plans several moves ahead',
    avatar: '🐭'
  }
};

/**
 * Get AI move based on difficulty level
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} aiPlayer - AI player number (PLAYER_1 or PLAYER_2)
 * @param {string} difficulty - AI difficulty level
 * @returns {number} Column index for AI move
 */
export function getAIMove(board, aiPlayer, difficulty = AI_LEVEL.MEDIUM) {
  const humanPlayer = aiPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1;
  
  switch (difficulty) {
    case AI_LEVEL.EASY:
      return getRandomMove(board);
    case AI_LEVEL.MEDIUM:
      return getMediumMove(board, aiPlayer, humanPlayer);
    case AI_LEVEL.HARD:
      return getHardMove(board, aiPlayer, humanPlayer);
    default:
      return getMediumMove(board, aiPlayer, humanPlayer);
  }
}

/**
 * Get a random valid move
 * @param {Array<Array<null|number>>} board - Current game board
 * @returns {number} Column index for move
 */
function getRandomMove(board) {
  const validMoves = getValidMoves(board);
  
  if (validMoves.length === 0) {
    return -1; // No valid moves
  }
  
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}

/**
 * Medium difficulty AI: Blocks obvious wins and takes obvious wins
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} aiPlayer - AI player number
 * @param {number} humanPlayer - Human player number
 * @returns {number} Column index for move
 */
function getMediumMove(board, aiPlayer, humanPlayer) {
  // Check if AI can win in one move
  const winningMove = findWinningMove(board, aiPlayer);
  if (winningMove !== -1) {
    return winningMove;
  }
  
  // Block human player from winning in one move
  const blockingMove = findWinningMove(board, humanPlayer);
  if (blockingMove !== -1) {
    return blockingMove;
  }
  
  // Prefer center column
  const centerColumn = 3;
  if (isValidMove(board, centerColumn)) {
    return centerColumn;
  }
  
  // Otherwise make a random move
  return getRandomMove(board);
}

/**
 * Hard difficulty AI: Uses deeper evaluation and looks ahead
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} aiPlayer - AI player number
 * @param {number} humanPlayer - Human player number
 * @returns {number} Column index for move
 */
function getHardMove(board, aiPlayer, humanPlayer) {
  // Check if AI can win in one move
  const winningMove = findWinningMove(board, aiPlayer);
  if (winningMove !== -1) {
    return winningMove;
  }
  
  // Block human player from winning in one move
  const blockingMove = findWinningMove(board, humanPlayer);
  if (blockingMove !== -1) {
    return blockingMove;
  }
  
  // Evaluate potential moves with minimax (limited depth)
  let bestScore = -Infinity;
  let bestMove = -1;
  const validMoves = getValidMoves(board);
  
  for (const colIndex of validMoves) {
    const { board: newBoard, rowIndex } = makeMove(board, colIndex, aiPlayer);
    
    // Skip invalid moves
    if (rowIndex === null) continue;
    
    // Evaluate this move
    const score = minimax(newBoard, 4, false, aiPlayer, humanPlayer, -Infinity, Infinity);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = colIndex;
    }
  }
  
  // If no good move found, use center or random
  if (bestMove === -1) {
    bestMove = isValidMove(board, 3) ? 3 : getRandomMove(board);
  }
  
  return bestMove;
}

/**
 * Find a winning move for the given player
 * @param {Array<Array<null|number>>} board - Current game board
 * @param {number} player - Player to find winning move for
 * @returns {number} Column index for winning move or -1 if none found
 */
function findWinningMove(board, player) {
  for (let col = 0; col < COLS; col++) {
    if (!isValidMove(board, col)) continue;
    
    const { board: newBoard, rowIndex } = makeMove(board, col, player);
    
    if (rowIndex !== null) {
      const winResult = checkWin(newBoard, rowIndex, col);
      if (winResult.win) {
        return col;
      }
    }
  }
  
  return -1; // No winning move found
}

/**
 * Evaluate the board position for the AI player
 * Positive score is good for AI, negative is good for human
 * @param {Array<Array<null|number>>} board - Game board
 * @param {number} aiPlayer - AI player number
 * @param {number} humanPlayer - Human player number
 * @returns {number} Score for the position
 */
function evaluateBoard(board, aiPlayer, humanPlayer) {
  let score = 0;
  
  // Evaluate horizontal windows
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      score += evaluateWindow(
        [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]],
        aiPlayer,
        humanPlayer
      );
    }
  }
  
  // Evaluate vertical windows
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      score += evaluateWindow(
        [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]],
        aiPlayer,
        humanPlayer
      );
    }
  }
  
  // Evaluate diagonal (down-right) windows
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      score += evaluateWindow(
        [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]],
        aiPlayer,
        humanPlayer
      );
    }
  }
  
  // Evaluate diagonal (down-left) windows
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = COLS - 1; col >= 3; col--) {
      score += evaluateWindow(
        [board[row][col], board[row+1][col-1], board[row+2][col-2], board[row+3][col-3]],
        aiPlayer,
        humanPlayer
      );
    }
  }
  
  // Prefer center column
  const centerCol = Math.floor(COLS / 2);
  for (let row = 0; row < ROWS; row++) {
    if (board[row][centerCol] === aiPlayer) {
      score += 3;
    }
  }
  
  return score;
}

/**
 * Evaluate a window of 4 cells
 * @param {Array<null|number>} window - Array of 4 cells
 * @param {number} aiPlayer - AI player number
 * @param {number} humanPlayer - Human player number
 * @returns {number} Score for this window
 */
function evaluateWindow(window, aiPlayer, humanPlayer) {
  const aiCount = window.filter(cell => cell === aiPlayer).length;
  const humanCount = window.filter(cell => cell === humanPlayer).length;
  const emptyCount = window.filter(cell => cell === EMPTY).length;
  
  // AI win
  if (aiCount === 4) return 100;
  
  // AI can win next move
  if (aiCount === 3 && emptyCount === 1) return 5;
  
  // AI has two in a row with spaces
  if (aiCount === 2 && emptyCount === 2) return 2;
  
  // Human win (very bad)
  if (humanCount === 4) return -100;
  
  // Human can win next move (block urgently)
  if (humanCount === 3 && emptyCount === 1) return -10;
  
  // Human has two in a row with spaces
  if (humanCount === 2 && emptyCount === 2) return -2;
  
  return 0;
}

/**
 * Minimax algorithm for evaluating future positions (with alpha-beta pruning)
 * @param {Array<Array<null|number>>} board - Current board
 * @param {number} depth - Search depth remaining
 * @param {boolean} isMaximizing - Whether current player is maximizing
 * @param {number} aiPlayer - AI player number
 * @param {number} humanPlayer - Human player number
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @returns {number} Score for this position
 */
function minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
  // Terminal conditions
  const validMoves = getValidMoves(board);
  
  // Game over or max depth reached
  if (depth === 0 || validMoves.length === 0) {
    return evaluateBoard(board, aiPlayer, humanPlayer);
  }
  
  // Check for immediate wins/losses
  for (const col of validMoves) {
    const player = isMaximizing ? aiPlayer : humanPlayer;
    const { board: newBoard, rowIndex } = makeMove(board, col, player);
    
    if (rowIndex !== null) {
      const winResult = checkWin(newBoard, rowIndex, col);
      if (winResult.win) {
        return isMaximizing ? 1000 : -1000;
      }
    }
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    
    for (const col of validMoves) {
      const { board: newBoard, rowIndex } = makeMove(board, col, aiPlayer);
      
      if (rowIndex === null) continue;
      
      const evalScore = minimax(newBoard, depth - 1, false, aiPlayer, humanPlayer, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      
      // Alpha-beta pruning
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    
    for (const col of validMoves) {
      const { board: newBoard, rowIndex } = makeMove(board, col, humanPlayer);
      
      if (rowIndex === null) continue;
      
      const evalScore = minimax(newBoard, depth - 1, true, aiPlayer, humanPlayer, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      
      // Alpha-beta pruning
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    
    return minEval;
  }
}
