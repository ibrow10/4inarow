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
import { getAIMove, AI_LEVEL, AI_PERSONA } from './aiPlayer';

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
  const [aiDifficulty, setAiDifficulty] = useState(AI_LEVEL.ROSIE); // Default to Rosie (medium)
  const [aiThinking, setAiThinking] = useState(false);
  const [playerColor, setPlayerColor] = useState(PLAYER_1); // Human player color
  const [dropAnimation, setDropAnimation] = useState({ active: false, col: null, row: null });
  const [showPersonaInfo, setShowPersonaInfo] = useState(false);
  
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
    // Get current AI persona if in AI mode
    const currentPersona = AI_PERSONA[aiDifficulty];
    
    if (gameStatus === 'win') {
      const winnerText = gameMode === 'player-vs-ai' 
        ? (winner === playerColor ? 'You win!' : `${currentPersona.name} wins!`) 
        : `Player ${winner} wins!`;
      return <div className="status">{winnerText}</div>;
    } else if (gameStatus === 'draw') {
      return <div className="status">Game ended in a draw!</div>;
    } else if (aiThinking) {
      return <div className="status thinking">
        <span className="ai-avatar">{currentPersona.avatar}</span> 
        {currentPersona.name} is thinking...
      </div>;
    } else if (dropAnimation.active) {
      return <div className="status">Making move...</div>;
    } else {
      const turnText = gameMode === 'player-vs-ai'
        ? (currentPlayer === playerColor ? 'Your turn' : `${currentPersona.name}'s turn ${currentPersona.avatar}`)
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
              <label>Choose Your Opponent:</label>
              <div className="persona-container">
                <div 
                  className={`persona-card ${aiDifficulty === AI_LEVEL.JIM ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.JIM)}
                >
                  <div className="persona-avatar">{AI_PERSONA[AI_LEVEL.JIM].avatar}</div>
                  <div className="persona-name">{AI_PERSONA[AI_LEVEL.JIM].name}</div>
                  <div className="persona-difficulty">Beginner</div>
                  <div className="persona-info-icon" onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonaInfo(AI_LEVEL.JIM);
                  }}>ℹ️</div>
                </div>
                
                <div 
                  className={`persona-card ${aiDifficulty === AI_LEVEL.ROSIE ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.ROSIE)}
                >
                  <div className="persona-avatar">{AI_PERSONA[AI_LEVEL.ROSIE].avatar}</div>
                  <div className="persona-name">{AI_PERSONA[AI_LEVEL.ROSIE].name}</div>
                  <div className="persona-difficulty">Intermediate</div>
                  <div className="persona-info-icon" onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonaInfo(AI_LEVEL.ROSIE);
                  }}>ℹ️</div>
                </div>
                
                <div 
                  className={`persona-card ${aiDifficulty === AI_LEVEL.DANGERMOUSE ? 'active' : ''}`}
                  onClick={() => changeAiDifficulty(AI_LEVEL.DANGERMOUSE)}
                >
                  <div className="persona-avatar">{AI_PERSONA[AI_LEVEL.DANGERMOUSE].avatar}</div>
                  <div className="persona-name">{AI_PERSONA[AI_LEVEL.DANGERMOUSE].name}</div>
                  <div className="persona-difficulty">Expert</div>
                  <div className="persona-info-icon" onClick={(e) => {
                    e.stopPropagation();
                    setShowPersonaInfo(AI_LEVEL.DANGERMOUSE);
                  }}>ℹ️</div>
                </div>
              </div>
              
              {showPersonaInfo && (
                <div className="persona-info-modal">
                  <div className="persona-info-content">
                    <div className="persona-info-header">
                      <span className="persona-info-avatar">{AI_PERSONA[showPersonaInfo].avatar}</span>
                      <h3>{AI_PERSONA[showPersonaInfo].name}</h3>
                      <button className="close-button" onClick={() => setShowPersonaInfo(false)}>×</button>
                    </div>
                    <p>{AI_PERSONA[showPersonaInfo].description}</p>
                  </div>
                </div>
              )}
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
          font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0 auto;
          max-width: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          min-height: 100vh;
          color: #333;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .status {
          font-size: clamp(1.1rem, 3vw, 1.3rem);
          margin-bottom: 20px;
          font-weight: 600;
          text-align: center;
          min-height: 40px;
          padding: 10px;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .status.thinking {
          color: #3498db;
          animation: pulse-subtle 2s infinite;
        }
        
        .ai-avatar {
          font-size: 1.4em;
          margin-right: 5px;
        }
        
        .board {
          display: flex;
          background: linear-gradient(145deg, #3498db, #2980b9);
          padding: clamp(8px, 2vw, 15px);
          border-radius: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), inset 0 -5px 0 rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          width: fit-content;
          transition: transform 0.3s ease;
        }
        
        .board:hover {
          transform: translateY(-5px);
        }
        
        .column {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        
        .column.hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
        }
        
        .column.full, .column.not-interactive {
          cursor: not-allowed;
          opacity: 0.8;
        }
        
        .cell {
          width: clamp(35px, 10vw, 60px);
          height: clamp(35px, 10vw, 60px);
          margin: clamp(4px, 1vw, 6px);
          border-radius: 50%;
          background-color: #ecf0f1;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
        }
        
        .cell.player1 {
          background: linear-gradient(145deg, #ff5e54, #e74c3c);
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(231, 76, 60, 0.3);
        }
        
        .cell.player2 {
          background: linear-gradient(145deg, #ffeb3b, #f9ca24);
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(249, 202, 36, 0.3);
        }
        
        .cell.winning {
          box-shadow: 0 0 15px 5px #2ecc71, inset 0 0 15px rgba(0, 0, 0, 0.2);
          animation: pulse 1.5s infinite;
          z-index: 1;
        }
        
        .cell.dropping {
          animation: dropAnimation 0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000);
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 15px 5px #2ecc71, inset 0 0 15px rgba(0, 0, 0, 0.2); }
          50% { box-shadow: 0 0 25px 8px #2ecc71, inset 0 0 15px rgba(0, 0, 0, 0.2); }
          100% { box-shadow: 0 0 15px 5px #2ecc71, inset 0 0 15px rgba(0, 0, 0, 0.2); }
        }
        
        @keyframes pulse-subtle {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        
        @keyframes dropAnimation {
          0% { opacity: 0; transform: translateY(-500%); }
          60% { opacity: 1; transform: translateY(15%); }
          80% { transform: translateY(-10%); }
          100% { transform: translateY(0); }
        }
        
        .reset-button {
          margin-top: 25px;
          padding: 12px 25px;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          background: linear-gradient(145deg, #2ecc71, #27ae60);
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
          transition: all 0.3s ease;
        }
        
        .reset-button:hover {
          background: linear-gradient(145deg, #27ae60, #2ecc71);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(39, 174, 96, 0.4);
        }
        
        .game-settings {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 25px;
          width: 100%;
          max-width: 500px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .setting-group label {
          font-weight: 600;
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          color: #2c3e50;
        }
        
        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .button-group button {
          flex: 1;
          min-width: 100px;
          padding: 10px;
          font-size: clamp(0.9rem, 2vw, 1rem);
          border: none;
          background: linear-gradient(145deg, #f5f7fa, #e4e9f2);
          cursor: pointer;
          border-radius: 30px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .button-group button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .button-group button.active {
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          font-weight: bold;
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }
        
        .color-button.player1 {
          color: white;
          background: linear-gradient(145deg, #ff5e54, #e74c3c) !important;
          box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3) !important;
        }
        
        .color-button.player2 {
          background: linear-gradient(145deg, #ffeb3b, #f9ca24) !important;
          box-shadow: 0 2px 5px rgba(249, 202, 36, 0.3) !important;
        }
        
        .instructions {
          margin-top: 25px;
          text-align: center;
          max-width: 500px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .instructions h3 {
          margin-bottom: 10px;
          color: #2c3e50;
        }
        
        .instructions p {
          line-height: 1.6;
        }
        
        /* Persona cards styling */
        .persona-container {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .persona-card {
          flex: 1;
          min-width: 120px;
          max-width: 180px;
          background: linear-gradient(145deg, #f5f7fa, #e4e9f2);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        
        .persona-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .persona-card.active {
          background: linear-gradient(145deg, #e1f5fe, #b3e5fc);
          box-shadow: 0 8px 20px rgba(3, 169, 244, 0.2);
          border: 2px solid #03a9f4;
        }
        
        .persona-avatar {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        
        .persona-name {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 5px;
          text-align: center;
        }
        
        .persona-difficulty {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 5px;
          text-align: center;
        }
        
        .persona-info-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .persona-info-icon:hover {
          transform: scale(1.2);
        }
        
        .persona-info-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .persona-info-content {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 90%;
          width: 350px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .persona-info-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          position: relative;
        }
        
        .persona-info-avatar {
          font-size: 2rem;
          margin-right: 15px;
        }
        
        .persona-info-header h3 {
          margin: 0;
        }
        
        .close-button {
          position: absolute;
          right: 0;
          top: 0;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #7f8c8d;
        }
        
        .close-button:hover {
          color: #2c3e50;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 600px) {
          .connect4-game {
            padding: 15px 10px;
          }
          
          .game-settings {
            padding: 15px;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .button-group button {
            width: 100%;
          }
          
          .persona-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
          }
          
          .persona-card {
            min-width: 0;
            width: 100%;
            max-width: none;
            padding: 10px 5px;
            margin: 0;
          }
          
          .persona-avatar {
            font-size: 1.8rem;
            margin-bottom: 5px;
          }
          
          .persona-name {
            font-size: 0.9rem;
            margin-bottom: 3px;
          }
          
          .persona-difficulty {
            font-size: 0.75rem;
            margin-bottom: 3px;
          }
          
          .persona-info-icon {
            top: 5px;
            right: 5px;
            font-size: 0.8rem;
          }
          
          .board {
            transform: scale(0.9);
            margin: -10px auto;
          }
          
          .cell {
            width: clamp(30px, 8vw, 45px);
            height: clamp(30px, 8vw, 45px);
            margin: clamp(3px, 0.8vw, 5px);
          }
          
          /* Improve modal for mobile */
          .persona-info-content {
            padding: 15px;
            max-width: 85%;
            width: 300px;
          }
          
          .persona-info-avatar {
            font-size: 1.5rem;
            margin-right: 10px;
          }
          
          .persona-info-header h3 {
            font-size: 1.2rem;
          }
        }
        
        /* Extra small screens */
        @media (max-width: 350px) {
          .persona-container {
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
          }
          
          .persona-card {
            padding: 8px 3px;
          }
          
          .persona-avatar {
            font-size: 1.5rem;
            margin-bottom: 3px;
          }
          
          .persona-name {
            font-size: 0.8rem;
            margin-bottom: 2px;
          }
          
          .persona-difficulty {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Connect4Game;
