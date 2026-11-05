import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { SpeakerIcon, SpeakerMutedIcon } from './GameIcons';
import { getSettings, subscribe, setMuted, setVolume, play } from './sound';
import './SoundControl.css';

// HUD button that opens a small panel with a sound on/off switch and a volume
// slider. Settings are saved by the sound module, so they carry across visits.
function SoundControl({ className = '' }) {
  const { muted, volume } = useSyncExternalStore(subscribe, getSettings, getSettings);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const silent = muted || volume === 0;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleMuted = () => {
    if (silent) {
      setMuted(false);
      if (volume === 0) setVolume(0.7);
      play('select');
    } else {
      setMuted(true);
    }
  };

  return (
    <div className={`sound-control ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="hud-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={silent ? 'Sound settings (muted)' : 'Sound settings'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {silent ? <SpeakerMutedIcon /> : <SpeakerIcon />}
        <span className="hud-btn-label">Sound</span>
      </button>
      {open && (
        <div className="sound-panel" role="group" aria-label="Sound settings">
          <div className="sound-panel-row">
            <span className="sound-panel-title" id="sound-panel-title">Sound effects</span>
            <button
              type="button"
              role="switch"
              aria-checked={!silent}
              aria-labelledby="sound-panel-title"
              className={`sound-switch${silent ? '' : ' is-on'}`}
              onClick={toggleMuted}
            >
              <span className="sound-switch-knob" />
            </button>
          </div>
          <label className="sound-panel-volume">
            <span>Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(volume * 100)}
              disabled={muted}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              onPointerUp={() => play('select')}
              onKeyUp={() => play('click')}
              style={{ '--fill': `${Math.round(volume * 100)}%` }}
            />
            <span className="sound-panel-value">{Math.round(volume * 100)}</span>
          </label>
        </div>
      )}
    </div>
  );
}

export default SoundControl;
