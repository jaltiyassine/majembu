import '../css/footer.css';

import * as React from 'react';
import LockIcon from '@mui/icons-material/Lock';

export default function InfoFooter(){
  return (
    <footer className="footer">
      <div className="message-container">
        <LockIcon className="lock-icon" />
        <p className="message">
        Your data is secure—privacy is our priority.&nbsp;
          <span 
          className="learn-more" 
          onClick={() => chrome.tabs.create({ url: "privacy-terms.html" })}
          role="button"
          >
          Learn More
          </span>
        </p>
      </div>
    </footer>
  );
}