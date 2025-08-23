import React, { useState, useEffect } from 'react';

function FlyingText({ damage, type = 'damage', onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Wait for fade out animation
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const getTextColor = () => {
    switch (type) {
      case 'damage':
        return '#ef4444'; // red
      case 'heal':
        return '#22c55e'; // green
      case 'defense':
        return '#3b82f6'; // blue
      default:
        return '#ef4444';
    }
  };

  const getText = () => {
    if (type === 'heal') {
      return `+${damage}`;
    }
    return `-${damage}`;
  };

  return (
    <div 
      className="flying-text"
      style={{ 
        color: getTextColor(),
        '--damage-value': damage 
      }}
    >
      {getText()}
    </div>
  );
}

export default FlyingText;
