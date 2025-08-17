import React, { useState } from 'react';
import Game from './Game';
import DeckBuilder from './DeckBuilder';
import { DECK_SIZE } from './constants';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'sp_random', 'sp_builder', 'mp_builder'
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);

  const handleDecksSelected = (p1, p2) => {
    setPlayer1Deck(p1);
    setPlayer2Deck(p2);
  };

  // Show deck builder for 2-player mode
  if (gameMode === 'mp_builder' && (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE)) {
    return (
      <div className="App">
        <DeckBuilder onDecksSelected={handleDecksSelected} />
      </div>
    );
  }

  // Show deck builder for single-player (advanced) mode
  if (gameMode === 'sp_builder' && player1Deck.length !== DECK_SIZE) {
    return (
      <div className="App">
        <DeckBuilder onDecksSelected={handleDecksSelected} singlePlayer />
      </div>
    );
  }

  return (
    <div className="App">
      {gameMode === null && (
        <div className="entry-screen">
          <div className="select-panel panel">
            <h1 className="title">Fantasy Card Game</h1>
            <p className="subtitle">Choose a mode to begin.</p>
            <div className="cta-group">
              <button className="btn btn-primary" onClick={() => setGameMode('sp_random')}>Single Player (Quick)</button>
              <button className="btn btn-primary" onClick={() => setGameMode('sp_builder')}>Single Player (Advanced)</button>
              <button className="btn btn-secondary" onClick={() => setGameMode('mp_builder')}>Two Players (Local)</button>
            </div>
          </div>
        </div>
      )}
      {gameMode === 'sp_random' && <Game singlePlayer />}
      {gameMode === 'sp_builder' && player1Deck.length === DECK_SIZE && (
        <Game player1Deck={player1Deck} singlePlayer />
      )}
      {gameMode === 'mp_builder' && player1Deck.length === DECK_SIZE && player2Deck.length === DECK_SIZE && (
        <Game player1Deck={player1Deck} player2Deck={player2Deck} />
      )}
    </div>
  );
}

export default App;
