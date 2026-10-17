// Runs a match in the browser (AI, hot-seat and tutorial modes) on top of the
// shared engine in engine/match.js, and turns each round's events into the
// bits the game screen animates. useOnlineMatch exposes the same shape, so
// Game.js does not care where a round was resolved.
//
//   const match = useLocalMatch({ p1Deck, p2Deck, seed });
//   match.hands.p1 / .p2        cards to draw (dying cards linger for the fade)
//   match.selection.p1 / .p2    { uid, style } so far this round
//   match.select(side, uid) / match.choose(side, style) / match.clearSelections()
//   match.canFight / match.fight()
//   match.round, match.isOver, match.winner
//   match.log, match.damageEvents.p1 / .p2, match.abilityUsed, match.dying
//   match.result                 round or game result for the dialog (null to dismiss)
//   match.lastRound              the engine's roundResolved / gameOver events for the tutorial
import { useCallback, useEffect, useRef, useState } from 'react';
import { createMatch, applyIntent, resolveRound, SIDES } from '../engine/match';
import { snapshotCreature } from '../BattleResult';

const DEATH_FADE_MS = 600;
const POPUP_MS = 2000;

const EMPTY_SELECTION = { p1: { uid: null, style: '' }, p2: { uid: null, style: '' } };

const findCard = (hand, uid) => hand.find(c => c.uid === uid) || null;

export default function useLocalMatch({ p1Deck, p2Deck, seed }) {
  const [state, setState] = useState(() => createMatch({ p1Deck, p2Deck, seed }));
  const [selection, setSelection] = useState(EMPTY_SELECTION);

  // Presentation state fed by the last round's events
  const [log, setLog] = useState([]);
  const [damageEvents, setDamageEvents] = useState({ p1: [], p2: [] });
  const [abilityUsed, setAbilityUsed] = useState(null);
  const [dying, setDying] = useState([]);            // dead cards still on screen: { side, card }
  const [result, setResult] = useState(null);
  const [lastRound, setLastRound] = useState(null);  // { resolved, gameOver } for the tutorial
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const select = useCallback((side, uid) => {
    setSelection(prev => ({ ...prev, [side]: { ...prev[side], uid } }));
  }, []);

  const choose = useCallback((side, style) => {
    setSelection(prev => ({ ...prev, [side]: { ...prev[side], style } }));
  }, []);

  const clearSelections = useCallback(() => setSelection(EMPTY_SELECTION), []);

  const picked = (side) => {
    const { uid, style } = selection[side];
    return !!(uid && style && findCard(state.sides[side].hand, uid));
  };
  const canFight = state.phase === 'pick' && picked('p1') && picked('p2');

  const fight = useCallback(() => {
    if (!canFight) return;
    let locked = state;
    SIDES.forEach(side => {
      locked = applyIntent(locked, side, { type: 'pick', uid: selection[side].uid, style: selection[side].style });
      locked = applyIntent(locked, side, { type: 'lock' });
    });
    const { state: next, events } = resolveRound(locked);

    // Log lines
    setLog(prev => [...prev, ...events.filter(e => e.type === 'log').map(e => ({ text: e.text, type: e.logType, style: e.style }))]);

    // Flying numbers, keyed the way Card.js expects
    const popups = { p1: [], p2: [] };
    events.forEach(e => {
      if (e.type === 'dot' || e.type === 'damage') popups[e.side].push({ damage: e.amount, type: 'damage', cardName: e.cardName || findCard(locked.sides[e.side].hand, e.uid)?.name });
      if (e.type === 'heal') popups[e.side].push({ damage: e.amount, type: 'heal', cardName: findCard(locked.sides[e.side].hand, e.uid)?.name });
    });
    setDamageEvents(popups);
    later(() => setDamageEvents({ p1: [], p2: [] }), POPUP_MS);

    const ability = events.find(e => e.type === 'ability');
    setAbilityUsed(ability ? { ability: ability.ability, cardName: ability.cardName, side: ability.side } : null);
    later(() => setAbilityUsed(null), POPUP_MS);

    // Dead cards fade out before leaving the hand
    const deaths = events.filter(e => e.type === 'death');
    if (deaths.length) {
      setDying(prev => [...prev, ...deaths.map(d => ({ side: d.side, card: d.card }))]);
      later(() => setDying(prev => prev.filter(d => !deaths.some(x => x.uid === d.card.uid))), DEATH_FADE_MS);
    }

    // Keep a surviving pick selected; a fallen creature's side picks again
    setSelection(prev => {
      const nextSel = { ...prev };
      SIDES.forEach(side => {
        if (!findCard(next.sides[side].hand, prev[side].uid)) nextSel[side] = { uid: null, style: '' };
      });
      return nextSel;
    });

    // Result dialogs
    const roundResult = events.find(e => e.type === 'roundResult');
    const gameOver = events.find(e => e.type === 'gameOver');
    const cardAfter = (uid) => {
      const side = uid.startsWith('p1') ? 'p1' : 'p2';
      return findCard(next.sides[side].hand, uid) || deaths.find(d => d.uid === uid)?.card;
    };
    if (gameOver) {
      setResult({ kind: 'game', winnerSide: gameOver.winnerSide, survivors: gameOver.survivors.map(uid => snapshotCreature(cardAfter(uid))) });
    } else if (roundResult) {
      setResult({
        kind: 'round',
        round: roundResult.round,
        winnerSide: roundResult.winnerSide,
        winner: snapshotCreature(cardAfter(roundResult.winnerUid)),
        loser: snapshotCreature(cardAfter(roundResult.loserUid)),
      });
    }

    setLastRound({ resolved: events.find(e => e.type === 'roundResolved'), gameOver });
    setState(next);
  }, [canFight, state, selection]);

  // Hands as drawn: live cards from the state plus any card mid-fade, in its old slot
  const hands = {};
  SIDES.forEach(side => {
    const live = state.sides[side].hand;
    const fading = dying.filter(d => d.side === side).map(d => d.card);
    if (!fading.length) { hands[side] = live; return; }
    const order = [...live, ...fading].sort((a, b) => Number(a.uid.split('-')[1]) - Number(b.uid.split('-')[1]));
    hands[side] = order;
  });

  return {
    state,
    hands,
    selection,
    select,
    choose,
    clearSelections,
    canFight,
    fight,
    round: state.round,
    isOver: state.phase === 'over',
    winner: state.winner,
    log,
    damageEvents,
    abilityUsed,
    dying: dying.map(d => d.card.name),
    result,
    dismissResult: useCallback(() => setResult(null), []),
    lastRound,
  };
}
