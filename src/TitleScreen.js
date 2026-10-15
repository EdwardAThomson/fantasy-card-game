import React from 'react';
import creatures from './creatures';
import { ELEMENTS } from './constants';
import './TitleScreen.css';

const FIRST_YEAR = 2024;

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const SwordsIcon = () => (
  <svg {...svgProps}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6M16 16l4 4M19 21l2-2" />
    <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
    <path d="m11 19-6-6M8 16l-4 4M5 21l-2-2" />
  </svg>
);

const CardsIcon = () => (
  <svg {...svgProps}>
    <rect x="8" y="3" width="12" height="16" rx="2" transform="rotate(8 14 11)" />
    <rect x="4" y="5" width="12" height="16" rx="2" transform="rotate(-6 10 13)" />
    <path d="m10 10 1.2 2.4L13.5 13l-2.3.6L10 16l-1.2-2.4L6.5 13l2.3-.6Z" />
  </svg>
);

const DuelIcon = () => (
  <svg {...svgProps}>
    <circle cx="7" cy="7" r="3" />
    <circle cx="17" cy="7" r="3" />
    <path d="M2 20c0-3.3 2.2-6 5-6s5 2.7 5 6M12 20c0-3.3 2.2-6 5-6s5 2.7 5 6" />
  </svg>
);

const MODES = [
  {
    id: 'sp_random',
    title: 'Quick Battle',
    detail: 'Random decks against the AI',
    Icon: SwordsIcon,
    primary: true,
  },
  {
    id: 'sp_builder',
    title: 'Build Your Deck',
    detail: 'Pick three creatures, then face the AI',
    Icon: CardsIcon,
  },
  {
    id: 'mp_builder',
    title: 'Two Players',
    detail: 'Draft and duel on one screen',
    Icon: DuelIcon,
  },
];

function TitleScreen({ onSelectMode }) {
  const year = new Date().getFullYear();
  const years = year > FIRST_YEAR ? `${FIRST_YEAR}–${year}` : `${FIRST_YEAR}`;
  const elementCount = Object.keys(ELEMENTS).length;

  return (
    <div className="title-screen">
      <div className="title-backdrop" aria-hidden="true">
        <img src="/opening_image.png" alt="" className="title-backdrop-image" />
        <div className="title-embers" />
      </div>

      <main className="title-content">
        <header className="title-heading">
          <p className="title-kicker">A game of creatures and elements</p>
          <h1 className="title-logo">
            <span className="title-logo-word">Fantasy</span>
            <span className="title-logo-sub">Card Game</span>
          </h1>
          <div className="title-rule" aria-hidden="true" />
          <p className="title-tagline">
            {creatures.length} creatures · {elementCount} elements · one victor
          </p>
        </header>

        <nav className="title-menu" aria-label="Choose a game mode">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`title-menu-item${mode.primary ? ' is-primary' : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <span className="title-menu-icon" aria-hidden="true"><mode.Icon /></span>
              <span className="title-menu-text">
                <span className="title-menu-label">{mode.title}</span>
                <span className="title-menu-detail">{mode.detail}</span>
              </span>
              <span className="title-menu-chevron" aria-hidden="true">›</span>
            </button>
          ))}
        </nav>
      </main>

      <footer className="title-footer">
        © {years} Edward Thomson (Octonion Software)
      </footer>
    </div>
  );
}

export default TitleScreen;
