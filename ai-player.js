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
 * AI difficulty levels
 */
export const AI_LEVEL = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
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
 * Medium difficulty AI: Uses minimax with moderate depth (same as old hard level)
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
  
  // Evaluate potential moves with minimax (limited depth)
  let bestScore = -Infinity;
  let bestMove = -1;
  const validMoves = getValidMoves(board);
  
  for (const colIndex of validMoves) {
    const { board: newBoard, rowIndex } = makeMove(board, colIndex, aiPlayer);
    
    // Skip invalid moves
    if (rowIndex === null) continue;
    
    // Evaluate this move (depth 4, same as old hard level)
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
 * Hard difficulty AI: Unbeatable AI using deep minimax search and advanced evaluation
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
  
  // Count number of pieces to adjust search depth
  let piecesCount = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] !== EMPTY) {
        piecesCount++;
      }
    }
  }
  
  // Adjust search depth based on game progress
  // Deeper search at beginning and end, shallower in middle for performance
  let searchDepth = 6; // Default depth
  if (piecesCount < 10) {
    searchDepth = 8; // Deep search at beginning
  } else if (piecesCount > 30) {
    searchDepth = 10; // Very deep search near end
  }
  
  // Evaluate potential moves with deeper minimax
  let bestScore = -Infinity;
  let bestMove = -1;
  const validMoves = getValidMoves(board);
  
  // Prioritize center columns for initial evaluation
  const orderedMoves = [...validMoves].sort((a, b) => {
    return Math.abs(3 - a) - Math.abs(3 - b);
  });
  
  for (const colIndex of orderedMoves) {
    const { board: newBoard, rowIndex } = makeMove(board, colIndex, aiPlayer);
    
    // Skip invalid moves
    if (rowIndex === null) continue;
    
    // Check for immediate win
    const winResult = checkWin(newBoard, rowIndex, colIndex);
    if (winResult.win) {
      return colIndex; // Immediate win found
    }
    
    // Evaluate this move with deeper search
    const score = minimax(newBoard, searchDepth, false, aiPlayer, humanPlayer, -Infinity, Infinity);
    
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
    for (let col = 3; col < COLS; col++) {
      score += evaluateWindow(
        [board[row][col], board[row+1][col-1], board[row+2][col-2], board[row+3][col-3]],
        aiPlayer,
        humanPlayer
      );
    }
  }
  
  // Prefer center column
  const centerColumn = 3;
  for (let row = 0; row < ROWS; row++) {
    if (board[row][centerColumn] === aiPlayer) {
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
  // Count pieces in the window
  const aiCount = window.filter(cell => cell === aiPlayer).length;
  const humanCount = window.filter(cell => cell === humanPlayer).length;
  const emptyCount = window.filter(cell => cell === EMPTY).length;
  
  // Scoring based on pieces in window - enhanced for unbeatable AI
  if (aiCount === 4) return 1000; // AI win - higher value
  if (humanCount === 4) return -1000; // Human win - higher penalty
  
  if (aiCount === 3 && emptyCount === 1) return 50; // AI potential win - much higher priority
  if (humanCount === 3 && emptyCount === 1) return -50; // Block human potential win - much higher priority
  
  if (aiCount === 2 && emptyCount === 2) return 10; // AI building up - higher value
  if (humanCount === 2 && emptyCount === 2) return -10; // Human building up - higher penalty
  
  // New patterns
  if (aiCount === 1 && emptyCount === 3) return 1; // Starting to build
  if (humanCount === 1 && emptyCount === 3) return -1; // Human starting to build
  
  // Prefer empty windows slightly
  if (emptyCount === 4) return 0.5;
  
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
  // Base cases: terminal node or depth limit reached
  const validMoves = getValidMoves(board);
  
  if (depth === 0 || validMoves.length === 0) {
    return evaluateBoard(board, aiPlayer, humanPlayer);
  }
  
  if (isMaximizing) {
    // AI's turn (maximizing)
    let maxScore = -Infinity;
    
    for (const colIndex of validMoves) {
      const { board: newBoard, rowIndex } = makeMove(board, colIndex, aiPlayer);
      
      if (rowIndex === null) continue;
      
      // Check if this move wins
      const winResult = checkWin(newBoard, rowIndex, colIndex);
      if (winResult.win) {
        return 1000 * depth; // Winning sooner is better
      }
      
      const score = minimax(newBoard, depth - 1, false, aiPlayer, humanPlayer, alpha, beta);
      maxScore = Math.max(maxScore, score);
      
      // Alpha-beta pruning
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    
    return maxScore;
  } else {
    // Human's turn (minimizing)
    let minScore = Infinity;
    
    for (const colIndex of validMoves) {
      const { board: newBoard, rowIndex } = makeMove(board, colIndex, humanPlayer);
      
      if (rowIndex === null) continue;
      
      // Check if this move wins
      const winResult = checkWin(newBoard, rowIndex, colIndex);
      if (winResult.win) {
        return -1000 * depth; // Losing sooner is worse
      }
      
      const score = minimax(newBoard, depth - 1, true, aiPlayer, humanPlayer, alpha, beta);
      minScore = Math.min(minScore, score);
      
      // Alpha-beta pruning
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    
    return minScore;
  }
}
