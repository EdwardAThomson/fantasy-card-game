import React, { useState } from 'react';
import Game from './Game';
import DeckBuilder from './DeckBuilder';
import { DECK_SIZE } from './constants';
import './App.css';

function App() {
  const [players, setPlayers] = useState(null); // 1 or 2 players
  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);

  const handleDecksSelected = (p1, p2) => {
    setPlayer1Deck(p1);
    setPlayer2Deck(p2);
  };

  if (players === 2 && (player1Deck.length !== DECK_SIZE || player2Deck.length !== DECK_SIZE)) {
    return (
      <div className="App">
        <DeckBuilder onDecksSelected={handleDecksSelected} />
      </div>
    );
  }

  return (
    <div className="App">
      {players === null && (
        <div className="entry-screen">
          <div className="select-panel panel">
            <h1 className="title">Fantasy Card Game</h1>
            <p className="subtitle">Choose a mode to begin.</p>
            <div className="cta-group">
              <button className="btn btn-primary" onClick={() => setPlayers(1)}>Single Player (vs AI)</button>
              <button className="btn btn-secondary" onClick={() => setPlayers(2)}>Two Players (Local)</button>
            </div>
          </div>
        </div>
      )}
      {players === 1 && <Game singlePlayer />}
      {players === 2 && player1Deck.length === DECK_SIZE && player2Deck.length === DECK_SIZE && (
        <Game player1Deck={player1Deck} player2Deck={player2Deck} />
      )}
    </div>
  );
}

export default App;
