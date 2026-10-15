import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Tutorial.css';

const PANEL_SELECTOR = '[data-tutorial-panel]';
const ALWAYS_ALLOWED = [PANEL_SELECTOR, '[data-tutorial="home"]', '.modal-content'];
const GATED_EVENTS = ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown'];

const resolve = (value, ctx) => (typeof value === 'function' ? value(ctx) : value);

// A target may list fallbacks (e.g. the combat log panel on desktop, its
// toggle on phones); use the first one that is actually on screen.
const findTarget = (selector) => Array.from(document.querySelectorAll(selector))
  .find(node => node.getClientRects().length > 0) || null;

const advancesOn = (step, { type, payload }) => {
  const adv = step.advance;
  return !!adv && typeof adv === 'object' && adv.event === type && (!adv.match || adv.match(payload));
};

// Spotlight + coach panel for the guided fight. It never touches game state:
// Game reports what happened through `event`, and the overlay decides when to
// move on. Clicks outside the current step's allowed targets are swallowed.
function TutorialOverlay({ script, events, onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [ctx, setCtx] = useState({ lastRound: null, gameOver: null });
  const [tip, setTip] = useState(null);
  const [rect, setRect] = useState(null);
  const seenTips = useRef(new Set());
  const processed = useRef(0);

  const step = script.steps[stepIndex];
  const allow = step.allow === undefined ? (step.target ? [step.target] : []) : step.allow;
  const isFree = allow === null;

  const next = () => setStepIndex(i => Math.min(i + 1, script.steps.length - 1));

  // React to game events. Several can land in one render, so walk the queue.
  useEffect(() => {
    if (events.length <= processed.current) return;
    let index = stepIndex;
    let nextCtx = ctx;
    let nextTip = tip;
    events.slice(processed.current).forEach((event) => {
      const { type, payload } = event;
      if (type === 'roundResolved') nextCtx = { ...nextCtx, lastRound: payload };
      if (type === 'gameOver') nextCtx = { ...nextCtx, gameOver: payload };
      const current = script.steps[index];
      if (advancesOn(current, event)) {
        index = Math.min(index + 1, script.steps.length - 1);
        nextTip = null;
      } else if (type === 'roundResolved' && current.allow === null) {
        const fresh = script.tips.find(tp => !seenTips.current.has(tp.id) && tp.when(payload));
        if (fresh) {
          seenTips.current.add(fresh.id);
          nextTip = fresh;
        }
      }
    });
    processed.current = events.length;
    setCtx(nextCtx);
    setTip(nextTip);
    setStepIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // Track the spotlight target as the layout shifts (cards animate, panels open).
  useLayoutEffect(() => {
    if (!step.target) {
      setRect(null);
      return undefined;
    }
    const el = findTarget(step.target);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const measure = () => {
      const node = findTarget(step.target);
      if (!node) return setRect(null);
      const r = node.getBoundingClientRect();
      setRect(prev => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height)
        ? prev
        : { top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const id = setInterval(measure, 200);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(id);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step.target]);

  // Gate input in the capture phase, before React sees it.
  useEffect(() => {
    if (isFree) return undefined;
    const allowed = [...ALWAYS_ALLOWED, ...allow];
    const gate = (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target && allowed.some(sel => target.closest(sel))) return;
      if (e.type === 'keydown' && !['Enter', ' '].includes(e.key)) return;
      e.stopPropagation();
      e.preventDefault();
    };
    GATED_EVENTS.forEach(type => document.addEventListener(type, gate, true));
    return () => GATED_EVENTS.forEach(type => document.removeEventListener(type, gate, true));
    // allow is derived from the step, so the step index covers it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const title = resolve(step.title, ctx);
  const body = resolve(step.body, ctx);
  const guidedTotal = script.steps.filter(s => s.advance !== 'finish').length;
  const showDim = step.dim !== false;
  const pad = 8;
  const hole = rect && {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  // Place the panel below the target when there is room, otherwise above.
  let panelStyle;
  let placement = 'center';
  if (step.compact) {
    placement = 'corner';
  } else if (hole) {
    const below = window.innerHeight - (hole.top + hole.height);
    placement = below > 220 || below > hole.top ? 'below' : 'above';
    const left = Math.min(Math.max(hole.left + hole.width / 2, 180), window.innerWidth - 180);
    panelStyle = placement === 'below'
      ? { top: hole.top + hole.height + 12, left }
      : { bottom: window.innerHeight - hole.top + 12, left };
  }

  // Phones show the panel as a sheet; keep it on the opposite half from the target.
  const sheetTop = hole && hole.top + hole.height / 2 > window.innerHeight / 2;

  const shown = tip && isFree ? tip : null;

  return createPortal(
    <div className="tutorial-root" aria-live="polite">
      {showDim && !hole && <div className="tutorial-dim" />}
      {hole && (
        <div
          className={`tutorial-spotlight ${showDim ? 'is-dim' : ''}`}
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
        />
      )}

      <div
        className={`tutorial-panel placement-${placement}${sheetTop ? ' sheet-top' : ''}`}
        style={panelStyle}
        data-tutorial-panel
        role="dialog"
        aria-label={`Tutorial: ${title}`}
      >
        {step.advance !== 'finish' && (
          <div className="tutorial-progress">Step {Math.min(stepIndex + 1, guidedTotal)} of {guidedTotal}</div>
        )}
        <h3>{shown ? shown.title : title}</h3>
        <p>{shown ? shown.body : body}</p>
        <div className="tutorial-actions">
          {step.advance === 'finish' ? (
            <>
              <button className="btn btn-ghost" onClick={() => onFinish('menu')}>Back to menu</button>
              <button className="btn btn-primary" onClick={() => onFinish('quick')}>Play a quick match</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost tutorial-skip" onClick={() => onFinish('skipped')}>Skip tutorial</button>
              {shown && <button className="btn btn-primary" onClick={() => setTip(null)}>Got it</button>}
              {!shown && step.advance === 'next' && (
                <button className="btn btn-primary" onClick={next} autoFocus>Next</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TutorialOverlay;
