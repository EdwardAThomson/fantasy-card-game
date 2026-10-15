import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CrossedSwordsIcon } from '../GameIcons';
import './Tutorial.css';

const PANEL_SELECTOR = '[data-tutorial-panel]';
const ALWAYS_ALLOWED = [PANEL_SELECTOR, '[data-tutorial="home"]', '.modal-content'];
const GATED_EVENTS = ['click', 'pointerdown', 'mousedown', 'touchstart', 'keydown'];

const resolve = (value, ctx) => (typeof value === 'function' ? value(ctx) : value);

// A target may list fallbacks (e.g. the combat log panel on desktop, its
// toggle on phones); use the first one that is actually on screen.
const findTarget = (selector) => Array.from(document.querySelectorAll(selector))
  .find(node => node.getClientRects().length > 0) || null;

const GAP = 14;      // between the spotlight and the panel
const MARGIN = 12;   // between the panel and the viewport edge
const PAD = 8;       // spotlight padding around the target
const PHONE = 640;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, Math.max(lo, hi)));

// Put the panel on the first side of the target where it fits whole, keeping
// it on screen either way. Returns the panel position and where its pointer
// should sit along the facing edge.
const placePanel = (hole, size, vw, vh) => {
  const fits = {
    below: vh - (hole.top + hole.height) - GAP - MARGIN >= size.height,
    above: hole.top - GAP - MARGIN >= size.height,
    right: vw - (hole.left + hole.width) - GAP - MARGIN >= size.width,
    left: hole.left - GAP - MARGIN >= size.width,
  };
  const side = ['below', 'above', 'right', 'left'].find(k => fits[k]) || 'overlap';
  const cx = hole.left + hole.width / 2;
  const cy = hole.top + hole.height / 2;
  let top;
  let left;
  if (side === 'below' || side === 'above') {
    top = side === 'below' ? hole.top + hole.height + GAP : hole.top - GAP - size.height;
    left = clamp(cx - size.width / 2, MARGIN, vw - size.width - MARGIN);
  } else if (side === 'right' || side === 'left') {
    left = side === 'right' ? hole.left + hole.width + GAP : hole.left - GAP - size.width;
    top = clamp(cy - size.height / 2, MARGIN, vh - size.height - MARGIN);
  } else {
    // Target fills the screen: sit at the bottom edge over it.
    top = vh - size.height - MARGIN;
    left = clamp(cx - size.width / 2, MARGIN, vw - size.width - MARGIN);
  }
  const pointer = side === 'below' || side === 'above'
    ? clamp(cx - left, 24, size.width - 24)
    : clamp(cy - top, 24, size.height - 24);
  return { side, top, left, pointer };
};

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
  const [panelSize, setPanelSize] = useState(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
  const panelRef = useRef(null);
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
    const id = setInterval(measure, 150);
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

  // Size the panel after each render so placement can use its real height.
  // Compare outside setState: a no-op functional update still re-renders,
  // which would re-run this effect forever.
  // Runs after every render on purpose: the panel's text and layout change often.
  const sizeRef = useRef(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const { offsetWidth: width, offsetHeight: height } = node;
    const prev = sizeRef.current;
    if (prev && prev.width === width && prev.height === height) return;
    sizeRef.current = { width, height };
    setPanelSize(sizeRef.current);
  });

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const shown = tip && isFree ? tip : null;
  const isFinal = step.advance === 'finish';
  const title = shown ? shown.title : resolve(step.title, ctx);
  const body = shown ? shown.body : resolve(step.body, ctx);
  const guided = script.steps.filter(s => s.advance !== 'finish');
  const showDim = step.dim !== false;
  const hole = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  const isPhone = viewport.w <= PHONE;
  let layout = 'center';
  let panelStyle;
  let pointerSide = null;
  let pointerStyle;
  if (step.compact) {
    layout = 'corner';
  } else if (hole && isPhone) {
    // Phones: a sheet on whichever half of the screen the target isn't.
    layout = hole.top + hole.height / 2 > viewport.h / 2 ? 'sheet-top' : 'sheet-bottom';
  } else if (hole && panelSize) {
    const place = placePanel(hole, panelSize, viewport.w, viewport.h);
    layout = 'anchored';
    panelStyle = { top: place.top, left: place.left };
    if (place.side !== 'overlap') {
      pointerSide = place.side;
      pointerStyle = place.side === 'below' || place.side === 'above'
        ? { left: place.pointer }
        : { top: place.pointer };
    }
  } else if (hole) {
    // First frame, before the panel is measured: keep it out of sight.
    layout = 'anchored';
    panelStyle = { top: 0, left: 0, visibility: 'hidden' };
  }

  const isHero = !hole && !step.compact && showDim;
  const currentDot = Math.min(stepIndex, guided.length - 1);

  return createPortal(
    <div className="tutorial-root">
      {showDim && !hole && <div className="tutorial-dim" />}
      {hole && (
        <div
          className={`tutorial-spotlight${showDim ? ' is-dim' : ''}`}
          style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
        />
      )}

      <div
        ref={panelRef}
        key={shown ? `tip-${shown.id}` : `step-${stepIndex}`}
        className={[
          'tutorial-panel',
          `layout-${layout}`,
          isHero ? 'is-hero' : '',
          shown ? 'is-tip' : '',
          pointerSide ? `pointer-${pointerSide}` : '',
        ].filter(Boolean).join(' ')}
        style={panelStyle}
        data-tutorial-panel
        role="dialog"
        aria-live="polite"
        aria-label={`How to Play: ${title}`}
      >
        {pointerSide && <span className="tutorial-pointer" style={pointerStyle} aria-hidden="true" />}

        {isHero && (
          <div className="tutorial-crest" aria-hidden="true">
            <CrossedSwordsIcon size={30} />
          </div>
        )}

        <div className="tutorial-kicker">{shown ? 'Tip' : 'How to Play'}</div>
        <h3 className="tutorial-title">{title}</h3>
        <div className="tutorial-rule" aria-hidden="true" />
        <p className="tutorial-body">{body}</p>

        <div className="tutorial-footer">
          {isFinal ? (
            <div className="tutorial-actions is-final">
              <button className="btn btn-ghost tutorial-secondary" onClick={() => onFinish('menu')}>Back to menu</button>
              <button className="btn btn-primary tutorial-primary" onClick={() => onFinish('quick')} autoFocus>
                Play a quick match
              </button>
            </div>
          ) : (
            <>
              {!shown && (
                <div className="tutorial-progress" aria-label={`Step ${currentDot + 1} of ${guided.length}`}>
                  {guided.map((g, i) => (
                    <span
                      key={g.id}
                      className={`tutorial-dot${i < currentDot ? ' is-done' : ''}${i === currentDot ? ' is-current' : ''}`}
                    />
                  ))}
                </div>
              )}
              <div className="tutorial-actions">
                <button className="tutorial-skip" onClick={() => onFinish('skipped')}>Skip tutorial</button>
                {shown && (
                  <button className="btn btn-primary tutorial-primary" onClick={() => setTip(null)} autoFocus>Got it</button>
                )}
                {!shown && step.advance === 'next' && (
                  <button className="btn btn-primary tutorial-primary" onClick={next} autoFocus>Next</button>
                )}
                {!shown && step.advance !== 'next' && !isFree && (
                  <span className="tutorial-hint">{step.hint || 'Your move'}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TutorialOverlay;
