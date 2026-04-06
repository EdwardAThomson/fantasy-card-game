import React, { useState, useEffect, useRef } from 'react';

const MESSAGE_ICONS = {
  damage: '\u2694\uFE0F',
  heal: '\uD83D\uDC9A',
  status: '\u2728',
  ability: '\u26A1',
  death: '\uD83D\uDC80',
  victory: '\uD83C\uDFC6',
};

const STYLE_ICONS = {
  Melee: '\u2694\uFE0F',
  Ranged: '\uD83C\uDFF9',
  Magic: '\uD83E\uDE84',
};

function CombatLog({ messages, isOpen, onToggle }) {
  const logEndRef = useRef(null);
  const containerRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [toggledRounds, setToggledRounds] = useState(new Set());

  // Group messages into rounds by splitting on round-header messages
  const rounds = [];
  let current = { header: null, messages: [] };

  messages.forEach((msg) => {
    if (msg.type === 'round-header') {
      if (current.header || current.messages.length > 0) {
        rounds.push(current);
      }
      current = { header: msg, messages: [] };
    } else {
      current.messages.push(msg);
    }
  });
  if (current.header || current.messages.length > 0) {
    rounds.push(current);
  }

  const roundCount = rounds.length;

  // Latest round expanded by default, older rounds collapsed.
  // Clicking a round header toggles it from its default.
  const isExpanded = (idx) => {
    if (!rounds[idx]?.header) return true;
    const isLatest = idx === roundCount - 1;
    const isToggled = toggledRounds.has(idx);
    return isLatest ? !isToggled : isToggled;
  };

  const toggleRound = (idx) => {
    setToggledRounds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!userScrolled && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, userScrolled]);

  // Reset manual toggles when a new round starts
  useEffect(() => {
    setToggledRounds(new Set());
  }, [roundCount]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setUserScrolled(!atBottom);
  };

  const scrollToBottom = () => {
    setUserScrolled(false);
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div
        className={`combat-log${isOpen ? ' open' : ''}`}
        ref={containerRef}
        onScroll={handleScroll}
      >
        <h3>Combat Log</h3>

        {roundCount === 0 && (
          <p className="log-empty">Awaiting combat...</p>
        )}

        {rounds.map((round, rIdx) => {
          const expanded = isExpanded(rIdx);
          return (
            <div key={rIdx} className="log-round">
              {round.header && (
                <button
                  className="log-round-header"
                  onClick={() => toggleRound(rIdx)}
                  aria-expanded={expanded}
                >
                  <span className="log-round-arrow">{expanded ? '\u25BE' : '\u25B8'}</span>
                  <span>{round.header.text}</span>
                </button>
              )}
              {expanded &&
                round.messages.map((msg, mIdx) => {
                  if (msg.type === 'separator') {
                    return <div key={mIdx} className="log-separator" />;
                  }
                  return (
                    <div key={mIdx} className={`log-entry log-${msg.type}`}>
                      {((msg.style && STYLE_ICONS[msg.style]) || MESSAGE_ICONS[msg.type]) && (
                        <span className="log-icon">{(msg.style && STYLE_ICONS[msg.style]) || MESSAGE_ICONS[msg.type]}</span>
                      )}
                      <span className="log-text">{msg.text}</span>
                    </div>
                  );
                })}
            </div>
          );
        })}

        {userScrolled && messages.length > 0 && (
          <button className="log-scroll-btn" onClick={scrollToBottom}>
            &darr; Latest
          </button>
        )}
        <div ref={logEndRef} />
      </div>
      <button
        className="combat-log-toggle"
        onClick={onToggle}
        title="Toggle combat log"
      >
        {isOpen ? '\u2715' : '\uD83D\uDCDC'}
      </button>
    </>
  );
}

export default CombatLog;
