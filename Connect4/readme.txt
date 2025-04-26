# Connect 4 Game

A modern implementation of the classic Connect 4 game built with React, featuring both player-vs-player and player-vs-AI modes.

## Features

- Interactive game board with animations
- Player vs Player mode (local multiplayer)
- Player vs AI mode with three difficulty levels:
  - Easy: Random moves
  - Medium: Basic strategy with blocking
  - Hard: Advanced strategy with position evaluation
- Mobile-friendly responsive design
- Unit tests for game logic

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/connect4-game.git
cd connect4-game
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm start
```

The application will be available at http://localhost:3000

## Testing

Run the tests with:
```
npm test
```

## Project Structure

- `/src/gameLogic.js` - Core game mechanics (board creation, move validation, win detection)
- `/src/aiPlayer.js` - AI opponent logic with different difficulty levels
- `/src/Connect4Game.js` - Main React component for the game
- `/src/tests/` - Unit tests for game logic

## How to Play

1. Choose a game mode (Player vs Player or Player vs AI)
2. If playing against AI, select difficulty level and your color
3. Click on a column to drop your disc
4. The goal is to connect 4 of your discs in a row - horizontally, vertically, or diagonally
5. The game automatically detects wins and highlights the winning discs

## License

MIT

## Author

Your Name
