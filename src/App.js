import React, { useState } from 'react';
import Game from './Game';
import DeckBuilder from './DeckBuilder';
import { DECK_SIZE } from './constants';
import { HomeIcon } from './GameIcons';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState(null); // 'sp_random', 'sp_builder', 'mp_builder'
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);

  const handleDecksSelected = (p1, p2) => {
    setPlayer1Deck(p1);
    setPlayer2Deck(p2);
  };

  const handleReset = () => {
    setGameMode(null);
    setPlayer1Deck([]);
    setPlayer2Deck([]);
  };

  // The game screen draws its own Home button in its top bar; the deck
  // builder gets this floating one.
  const homeButton = (
    <button type="button" className="hud-btn home-button" onClick={handleReset} aria-label="Home">
      <HomeIcon />
      <span className="hud-btn-label">Home</span>
    </button>
  );

  const renderContent = () => {
    if (gameMode === 'mp_builder' && (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE)) {
      return <>{homeButton}<DeckBuilder onDecksSelected={handleDecksSelected} /></>;
    }

    if (gameMode === 'sp_builder' && player1Deck.length !== DECK_SIZE) {
      return <>{homeButton}<DeckBuilder onDecksSelected={handleDecksSelected} singlePlayer /></>;
    }

    if (gameMode === 'sp_random') {
      return <Game singlePlayer onHome={handleReset} />;
    }

    if (gameMode === 'sp_builder' && player1Deck.length === DECK_SIZE) {
      return <Game player1Deck={player1Deck} singlePlayer onHome={handleReset} />;
    }

    if (gameMode === 'mp_builder' && player1Deck.length === DECK_SIZE && player2Deck.length === DECK_SIZE) {
      return <Game player1Deck={player1Deck} player2Deck={player2Deck} onHome={handleReset} />;
    }

    return (
      <div className="entry-screen">
        <div className="game-title-container">
          <h1 className="game-title">Fantasy Card Game</h1>
          <img src="/opening_image.png" alt="Fantasy Card Game" className="opening-image" />
          <div className="select-panel panel">
            <p className="subtitle">Choose a mode to begin.</p>
            <div className="cta-group">
              <button className="btn btn-primary" onClick={() => setGameMode('sp_random')}>Single Player (Quick)</button>
              <button className="btn btn-primary" onClick={() => setGameMode('sp_builder')}>Single Player (Advanced)</button>
              <button className="btn btn-secondary" onClick={() => setGameMode('mp_builder')}>Two Players (Local)</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;