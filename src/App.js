import React from 'react';
import Game from './Game';  // Import the game component
import './App.css';  // CSS file


function App() {
  return (
    <div className="App">
      <h1>Fantasy Card Combat Game</h1>
      <div className="game-container">
        <Game />
      </div>
    </div>
  );
}

export default App;