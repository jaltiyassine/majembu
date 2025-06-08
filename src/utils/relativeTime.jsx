import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;

function calculateRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 0 && diff > -MILLISECONDS_PER_MINUTE) {
      return "Live now";
  }

  if (diff < 5 * MILLISECONDS_PER_MINUTE) {
    return "Live now";
  }

  else if (diff < MILLISECONDS_PER_HOUR) {
    const minutes = Math.floor(diff / MILLISECONDS_PER_MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  else if (diff < MILLISECONDS_PER_DAY) {
    const hours = Math.floor(diff / MILLISECONDS_PER_HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  else if (diff < MILLISECONDS_PER_WEEK) {
    const days = Math.floor(diff / MILLISECONDS_PER_DAY);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  else {
    const weeks = Math.floor(diff / MILLISECONDS_PER_WEEK);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
}

function RelativeTime({ lastSeen, className}) {
  const [displayText, setDisplayText] = useState(() => calculateRelativeTime(lastSeen));

  useEffect(() => {
    const updateDisplay = () => {
      setDisplayText(calculateRelativeTime(lastSeen));
    };

    updateDisplay();

    const intervalId = setInterval(updateDisplay, MILLISECONDS_PER_MINUTE);

    return () => clearInterval(intervalId);

  }, [lastSeen]);

  const isLive = displayText === "Live now";

  return (
    <span className={className}>
        {isLive ? (
        <span className="live-status-container">
            <span className="live-dot" aria-hidden="true"></span>
            <span>{displayText}</span>
        </span>
        ) : (
        displayText
        )}
    </span>
  );
}

RelativeTime.propTypes = {
  lastSeen: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default RelativeTime;