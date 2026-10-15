import React, { useState } from 'react';
import Game from './Game';
import DeckBuilder from './DeckBuilder';
import TitleScreen from './TitleScreen';
import TUTORIAL from './tutorial/tutorialScript';
import { DECK_SIZE } from './constants';
import { HomeIcon } from './GameIcons';
import './App.css';

const TUTORIAL_DONE_KEY = 'fcg.tutorialDone';

const readTutorialDone = () => {
  try {
    return window.localStorage.getItem(TUTORIAL_DONE_KEY) === '1';
  } catch (e) {
    return false;
  }
};

function App() {
  const [gameMode, setGameMode] = useState(null); // 'sp_random', 'sp_builder', 'mp_builder', 'tutorial'
  const [tutorialDone, setTutorialDone] = useState(readTutorialDone);
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

  const handleTutorialFinish = (next) => {
    try {
      window.localStorage.setItem(TUTORIAL_DONE_KEY, '1');
    } catch (e) {
      // Storage can be unavailable (private mode); the nudge just shows again.
    }
    setTutorialDone(true);
    setGameMode(next === 'quick' ? 'sp_random' : null);
  };

  const renderContent = () => {
    if (gameMode === 'mp_builder' && (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE)) {
      return <>{homeButton}<DeckBuilder onDecksSelected={handleDecksSelected} /></>;
    }

    if (gameMode === 'sp_builder' && player1Deck.length !== DECK_SIZE) {
      return <>{homeButton}<DeckBuilder onDecksSelected={handleDecksSelected} singlePlayer /></>;
    }

    if (gameMode === 'tutorial') {
      return <Game key="tutorial" tutorial={TUTORIAL} onTutorialFinish={handleTutorialFinish} singlePlayer onHome={handleReset} />;
    }

    if (gameMode === 'sp_random') {
      return <Game key="sp_random" singlePlayer onHome={handleReset} />;
    }

    if (gameMode === 'sp_builder' && player1Deck.length === DECK_SIZE) {
      return <Game player1Deck={player1Deck} singlePlayer onHome={handleReset} />;
    }

    if (gameMode === 'mp_builder' && player1Deck.length === DECK_SIZE && player2Deck.length === DECK_SIZE) {
      return <Game player1Deck={player1Deck} player2Deck={player2Deck} onHome={handleReset} />;
    }

    return <TitleScreen onSelectMode={setGameMode} tutorialDone={tutorialDone} />;
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;