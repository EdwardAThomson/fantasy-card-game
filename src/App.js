import React, { useState } from 'react';
import Game from './Game';
import DeckBuilder from './DeckBuilder';
import { DECK_SIZE } from './constants';
import './App.css';

function App() {
  const [mode, setMode] = useState(null); // 'random' or 'custom'
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);

  const handleDecksSelected = (p1, p2) => {
    setPlayer1Deck(p1);
    setPlayer2Deck(p2);
  };

  if (mode === 'custom' && (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE)) {
    return (
      <div className="App">
        <DeckBuilder onDecksSelected={handleDecksSelected} />
      </div>
    );
  }

  return (
    <div className="App">
      {mode === null && (
        <div>
          <h2>Select Game Mode</h2>
          <button onClick={() => setMode('random')}>Random Decks</button>
          <button onClick={() => setMode('custom')}>Choose Decks</button>
        </div>
      )}
      {mode === 'random' && <Game />}
      {mode === 'custom' && player1Deck.length === DECK_SIZE && player2Deck.length === DECK_SIZE && (
        <Game player1Deck={player1Deck} player2Deck={player2Deck} />
      )}
    </div>
  );
}

export default App;
