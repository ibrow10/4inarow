import React, { useState, useEffect } from 'react';
import { 
  ROWS, 
  COLS, 
  EMPTY, 
  PLAYER_1, 
  PLAYER_2, 
  createEmptyBoard, 
  findLowestEmptyRow,
  makeMove,
  isValidMove,
  getGameStatus
} from './gameLogic';
import { getAIMove, AI_LEVEL } from './aiPlayer';

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
