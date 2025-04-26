import React, { useState, useEffect } from 'react';

// Constants
const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

// AI difficulty levels
const AI_LEVEL = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Game logic functions
function createEmptyBoard() {
  return Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY));
}

function findLowestEmptyRow(board, colIndex) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][colIndex] === EMPTY) {
      return row;
    }
  }
  return -1; // Column is full
}

function checkDirection(board, row, col, direction, player) {
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

function checkWin(board, rowIndex, colIndex) {
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

function isBoardFull(board) {
  return board[0].every(cell => cell !== EMPTY);
}

function isValidMove(board, colIndex) {
  if (colIndex < 0 || colIndex >= COLS) {
    return false;
  }
  return findLowestEmptyRow(board, colIndex) !== -1;
}

function makeMove(board, colIndex, player) {
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

function getGameStatus(board, lastRow, lastCol) {
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

// AI player functions
function getRandomMove(board) {
  const validMoves = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidMove(board, col)) {
      validMoves.push(col);
    }
  }
  
  if (validMoves.length === 0) {
    return -1; // No valid moves
  }
  
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}

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

function evaluateWindow(window, aiPlayer, humanPlayer) {
  // Count pieces in the window
  const aiCount = window.filter(cell => cell === aiPlayer).length;
  const humanCount = window.filter(cell => cell === humanPlayer).length;
  const emptyCount = window.filter(cell => cell === EMPTY).length;
  
  // Scoring based on pieces in window
  if (aiCount === 4) return 100; // AI win
  if (humanCount === 4) return -100; // Human win
  
  if (aiCount === 3 && emptyCount === 1) return 5; // AI potential win
  if (humanCount === 3 && emptyCount === 1) return -5; // Block human potential win
  
  if (aiCount === 2 && emptyCount === 2) return 2; // AI building up
  if (humanCount === 2 && emptyCount === 2) return -2; // Human building up
  
  return 0;
}

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
  for (let row = 0; row < ROWS; row++) {
    if (board[row][3] === aiPlayer) {
      score += 3;
    }
  }
  
  return score;
}

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
  
  // Use a simplified evaluation for finding the best move
  let bestScore = -Infinity;
  let bestMove = -1;
  
  for (let col = 0; col < COLS; col++) {
    if (!isValidMove(board, col)) continue;
    
    const { board: newBoard, rowIndex } = makeMove(board, col, aiPlayer);
    if (rowIndex === null) continue;
    
    // Evaluate this position
    const score = evaluateBoard(newBoard, aiPlayer, humanPlayer);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    } else if (score === bestScore) {
      // If scores are equal, prefer center columns
      const currentDistanceFromCenter = Math.abs(3 - bestMove);
      const newDistanceFromCenter = Math.abs(3 - col);
      
      if (newDistanceFromCenter < currentDistanceFromCenter) {
        bestMove = col;
      }
    }
  }
  
  if (bestMove === -1) {
    bestMove = isValidMove(board, 3) ? 3 : getRandomMove(board);
  }
  
  return bestMove;
}

function getAIMove(board, aiPlayer, difficulty = AI_LEVEL.MEDIUM) {
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

// Main Connect4 component
const Connect4Game = () => {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [gameStatus, setGameStatus] = useState('inProgress'); // 'inProgress', 'win', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [gameMode, setGameMode] = useState('player-vs-player'); // 'player-vs-player', 'player-vs-ai'
  const [aiDifficulty, setAiDifficulty] = useState(AI_LEVEL.MEDIUM);
  const [aiThinking, setAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState(PLAYER_1); // Human player color
  const [dropAnimation, setDropAnimation] = useState({ active: false, col: null, row: null });
  
  // Use effect for AI turn
  useEffect(() => {
    // If it's AI's turn in player-vs-ai mode and game is in progress
    const isAiTurn = gameMode === 'player-vs-ai' && 
                     currentPlayer !== playerColor && 
                     gameStatus === 'inProgress';
    
    if (isAiTurn && !dropAnimation.active) {
      // Add a small delay to make it seem like AI is thinking
      setAiThinking(true);
      const aiTimer = setTimeout(() => {
        makeAIMove();
        setAiThinking(false);
      }, 800);
      
      return () => clearTimeout(aiTimer);
    }
  }, [currentPlayer, gameStatus, gameMode, playerColor, board, dropAnimation]);
  
  // AI makes a move
  const makeAIMove = () => {
    if (gameStatus !== 'inProgress') return;
    
    const aiPlayer = playerColor === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    const colIndex = getAIMove(board, aiPlayer, aiDifficulty);
    
    if (colIndex !== -1) {
      handleMove(colIndex);
    }
  };
  
  // Common function to handle moves (both player and AI)
  const handleMove = (colIndex) => {
    if (gameStatus !== 'inProgress' || !isValidMove(board, colIndex) || dropAnimation.active) return;
    
    const rowIndex = findLowestEmptyRow(board, colIndex);
    if (rowIndex === -1) return; // Invalid move
    
    // Start drop animation
    setDropAnimation({ active: true, col: colIndex, row: rowIndex, player: currentPlayer });
    
    // After animation completes, update the board
    setTimeout(() => {
      const { board: newBoard } = makeMove(board, colIndex, currentPlayer);
      setBoard(newBoard);
      
      // Check game status after move
      const status = getGameStatus(newBoard, rowIndex, colIndex);
      
      if (status.status === 'win') {
        setGameStatus('win');
        setWinner(status.winner);
        setWinningCells(status.winningCells);
      } else if (status.status === 'draw') {
        setGameStatus('draw');
      } else {
        // Switch player
        setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
      }
      
      // End animation
      setDropAnimation({ active: false, col: null, row: null });
    }, 400); // Animation duration
  };
  
  // Handle column click
  const handleColumnClick = (colIndex) => {
    // If it's AI's turn in player-vs-ai mode, do nothing
    if (gameMode === 'player-vs-ai' && currentPlayer !== playerColor) {
      return;
    }
    
    handleMove(colIndex);
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER_1);
    setGameStatus('inProgress');
    setWinner(null);
    setWinningCells([]);
    setHoverColumn(null);
    setAiThinking(false);
    setDropAnimation({ active: false, col: null, row: null });
  };
  
  // Change game mode
  const changeGameMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };
  
  // Change AI difficulty
  const changeAiDifficulty = (difficulty) => {
    setAiDifficulty(difficulty);
    resetGame();
  };
  
  // Change player color
  const changePlayerColor = (color) => {
    setPlayerColor(color);
    resetGame();
  };
  
  // Render a cell
  const renderCell = (value, rowIndex, colIndex) => {
    let cellClass = 'cell';
    
    // Handle animation
    if (dropAnimation.active && dropAnimation.col === colIndex && rowIndex <= dropAnimation.row) {
      if (rowIndex === dropAnimation.row) {
        cellClass += dropAnimation.player === PLAYER_1 ? ' player1 dropping' : ' player2 dropping';
      }
    } else if (value === PLAYER_1) {
      cellClass += ' player1';
    } else if (value === PLAYER_2) {
      cellClass += ' player2';
    }
    
    // Check if this cell is part of the winning combination
    const isWinningCell = winningCells.some(cell => 
      cell.row === rowIndex && cell.col === colIndex
    );
    
    if (isWinningCell) {
      cellClass += ' winning';
    }
    
    return (
      <div 
        key={`${rowIndex}-${colIndex}`} 
        className={cellClass}
      />
    );
  };
  
  // Render a column
  const renderColumn = (colIndex) => {
    const isColumnFull = findLowestEmptyRow(board, colIndex) === -1;
    const isHovered = hoverColumn === colIndex && !isColumnFull && gameStatus === 'inProgress';
    const isPlayerTurn = gameMode !== 'player-vs-ai' || currentPlayer === playerColor;
    const isInteractive = gameStatus === 'inProgress' && !dropAnimation.active && isPlayerTurn;
    
    return (
      <div 
        key={colIndex} 
        className={`column ${isHovered ? 'hover' : ''} ${isColumnFull ? 'full' : ''} ${!isInteractive ? 'not-interactive' : ''}`}
        onClick={() => handleColumnClick(colIndex)}
        onMouseEnter={() => setHoverColumn(colIndex)}
        onMouseLeave={() => setHoverColumn(null)}
      >
        {board.map((row, rowIndex) => renderCell(row[colIndex], rowIndex, colIndex))}
      </div>
    );
  };
  
  // Game status message
  const renderGameStatus = () => {
    if (gameStatus === 'win') {
      const winnerText = gameMode === 'player-vs-ai' 
        ? (winner === playerColor ? 'You win!' : 'AI wins!') 
        : `Player ${winner} wins!`;
      return <div className="status">{winnerText}</div>;
    } else if (gameStatus === 'draw') {
      return <div className="status">Game ended in a draw!</div>;
    } else if (aiThinking) {
      return <div className="status thinking">AI is thinking...</div>;
    } else if (dropAnimation.active) {
      return <div className="status">Making move...</div>;
    } else {
      const turnText = gameMode === 'player-vs-ai'
        ? (currentPlayer === playerColor ? 'Your turn' : 'AI turn')
        : `Player ${currentPlayer}'s turn`;
      return <div className="status">{turnText}</div>;
    }
  };
  
  // Render game settings
  const renderGameSettings = () => {
    return (
      <div className="game-settings">
        <div className="setting-group">
          <label>Game Mode:</label>
          <div className="button-group">
            <button 
              className={`mode-button ${gameMode === 'player-vs-player' ? 'active' : ''}`}
              onClick={() => changeGameMode('player-vs-player')}
            >
              Player vs Player
            </button>
            <button 
              className={`mode-button ${gameMode === 'player-vs-ai' ? 'active' : ''}`}
              onClick={() => changeGameMode('player-vs-ai')}
            >
              Player vs AI
            </button>
          </div>
        </div>
        
        {gameMode === 'player-vs-ai' && (
          <>
            <div className="setting-group">
              <label>AI Difficulty:</label>
              <div className="button-group">
                <button 
                  className={`difficulty-button ${aiDifficulty === AI_LEVEL.EASY ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.EASY)}
                >
                  Easy
                </button>
                <button 
                  className={`difficulty-button ${aiDifficulty === AI_LEVEL.MEDIUM ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.MEDIUM)}
                >
                  Medium
                </button>
                <button 
                  className={`difficulty-button ${aiDifficulty === AI_LEVEL.HARD ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.HARD)}
                >
                  Hard
                </button>
              </div>
            </div>
            
            <div className="setting-group">
              <label>Your Color:</label>
              <div className="button-group">
                <button 
                  className={`color-button player1 ${playerColor === PLAYER_1 ? 'active' : ''}`}
                  onClick={() => changePlayerColor(PLAYER_1)}
                >
                  Red
                </button>
                <button 
                  className={`color-button player2 ${playerColor === PLAYER_2 ? 'active' : ''}`}
                  onClick={() => changePlayerColor(PLAYER_2)}
                >
                  Yellow
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="connect4-game">
      <h1>Connect 4</h1>
      
      {renderGameSettings()}
      
      {renderGameStatus()}
      
      <div className="board">
        {Array(COLS).fill().map((_, colIndex) => renderColumn(colIndex))}
      </div>
      
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
      
      <div className="instructions">
        <h3>How to Play:</h3>
        <p>Click on a column to drop your disc. The goal is to connect 4 of your discs in a row - horizontally, vertically, or diagonally.</p>
      </div>
      
      <style jsx>{`
        .connect4-game {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
          margin: 10px auto;
          max-width: 100%;
          padding: 0 10px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 15px;
          font-size: clamp(1.5rem, 4vw, 2rem);
        }
        
        .status {
          font-size: clamp(1rem, 3vw, 1.2rem);
          margin-bottom: 15px;
          font-weight: bold;
          text-align: center;
          min-height: 30px;
        }
        
        .status.thinking {
          color: #0066cc;
        }
        
        .board {
          display: flex;
          background-color: #0066cc;
          padding: clamp(5px, 2vw, 10px);
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          margin: 0 auto;
          width: fit-content;
        }
        
        .column {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
        }
        
        .column.hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .column.full, .column.not-interactive {
          cursor: not-allowed;
        }
        
        .cell {
          width: clamp(30px, 10vw, 50px);
          height: clamp(30px, 10vw, 50px);
          margin: clamp(3px, 1vw, 5px);
          border-radius: 50%;
          background-color: white;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
          transition: background-color 0.3s ease;
          position: relative;
        }
        
        .cell.player1 {
          background-color: #ff4136;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        .cell.player2 {
          background-color: #ffdc00;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        .cell.winning {
          box-shadow: 0 0 10px 3px #4CAF50, inset 0 0 10px rgba(0, 0, 0, 0.3);
          animation: pulse 1.5s infinite;
        }
        
        .cell.dropping {
          animation: dropAnimation 0.4s ease-in;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 10px 3px #4CAF50, inset 0 0 10px rgba(0, 0, 0, 0.3); }
          50% { box-shadow: 0 0 15px 5px #4CAF50, inset 0 0 10px rgba(0, 0, 0, 0.3); }
          100% { box-shadow: 0 0 10px 3px #4CAF50, inset 0 0 10px rgba(0, 0, 0, 0.3); }
        }
        
        @keyframes dropAnimation {
          0% { opacity: 0; transform: translateY(-300%); }
          70% { opacity: 1; transform: translateY(10%); }
          85% { transform: translateY(-5%); }
          100% { transform: translateY(0); }
        }
        
        .reset-button {
          margin-top: 20px;
          padding: 10px 20px;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .reset-button:hover {
          background-color: #45a049;
        }
        
        .game-settings {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
          width: 100%;
          max-width: 400px;
        }
        
        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .setting-group label {
          font-weight: bold;
          font-size: clamp(0.9rem, 2.5vw, 1rem);
        }
        
        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .button-group button {
          flex: 1;
          min-width: 80px;
          padding: 8px;
          font-size: clamp(0.8rem, 2vw, 0.9rem);
          border: 1px solid #ddd;
          background-color: #f5f5f5;
          cursor: pointer;
          border-radius: 4px;
        }
        
        .button-group button.active {
          border-color: #0066cc;
          background-color: #e6f7ff;
          font-weight: bold;
        }
        
        .color-button.player1 {
          color: white;
          background-color: #ff4136;
          border-color: #ff4136;
        }
        
        .color-button.player2 {
          background-color: #ffdc00;
          border-color: #ffdc00;
        }
        
        .instructions {
          margin-top: 20px;
          text-align: center;
          max-width: 400px;
        }
        
        .instructions h3 {
          margin-bottom: 10px;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 480px) {
          .game-settings {
            padding: 0 5px;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .button-group button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Connect4Game;
