import '../css/dialogue.css';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import YouTubeIcon from '@mui/icons-material/YouTube';
import StatusCard from './statusCard';

export default function Dialogue({ dialogue, isError }) {
  const [shake, setShake] = useState(false);
  const status = useSelector(state => state.dialogue.status);

  useEffect(() => {
    if (isError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isError]);

  return (
    <div className="fadein-wrapper">
      <div className={`shake-wrapper ${shake ? "shake" : ""}`}>
        <div className={`dialogue ${shake ? "error-shine" : ""}`}>
          {dialogue == 0 ? (
            <span>
              Head to your{" "}
              <span
                className="instagram-link"
                onClick={() => chrome.tabs.create({ url: "https://www.instagram.com/direct/inbox/" })}
                role="button"
              >
                Instagram
              </span>{" "}
              inbox first!
            </span>
          ) : dialogue == 1 ? (
            <span>
              <span>Not sure what to do? Watch this quick tutorial on&nbsp;</span>
              <span
                onClick={() => chrome.tabs.create({ url: "https://www.youtube.com/watch?v=kmiWQKAWv54" })}
                role="button"
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "red",
                  textDecoration: "underline",
                  verticalAlign: "middle",
                }}
              >
              <span>YouTube</span>
              <YouTubeIcon />
              </span>
            </span>
          ) : dialogue === 2 ? (
            <StatusCard status={status}/>

          ) : dialogue === 3 ? (
            <span style={{color: "red"}}>{"Failed to start. Try again!"}</span>
          ) : (
            dialogue
          )}
        </div>
      </div>
    </div>
  );
}

Dialogue.propTypes = {
  dialogue: PropTypes.string.isRequired,
  isError: PropTypes.bool.isRequired
};