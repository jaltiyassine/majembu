import React from 'react';
import PropTypes from 'prop-types';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ForumIcon from '@mui/icons-material/Forum';
import '../css/chat.css';

import { useDispatch } from 'react-redux';
import { setTabIndex, setTabParam } from '../features/boolsSlice';

// components
import RelativeTime from '../utils/relativeTime';

function ChatCard({ chat }) {
  if (!chat || !chat.person) {
    return null;
  }
  
  const dispatch = useDispatch();

  const handleClick = () => {
      dispatch(setTabParam(chat));
      dispatch(setTabIndex(4));
  }

  return (
    <li className="chat-item" onClick={handleClick}>
        <div className="chat-avatar-container">
            <img
            src={chat.person.pp_url || null}
            alt={`Profile picture of ${chat.person.display_name || 'Unknown User'}`}
            className="chat-pp"
            />
            <ForumIcon className="chat-bubble-icon" sx={{color: "#FFFF"}} />
        </div>

        <div className="chat-details">
            <h3 className="chat-name">Conversation with {chat.person.display_name || 'Unknown User'}</h3>
            <RelativeTime lastSeen={chat.lastSeen} className="chat-time" />
        </div>
        <ArrowForwardIosIcon className="chat-arrow-icon" />
    </li>
  );
}

ChatCard.propTypes = {
  chat: PropTypes.shape({
    person: PropTypes.shape({
      pp_url: PropTypes.string,
      display_name: PropTypes.string,
      id: PropTypes.string,
    }).isRequired,
    lastSeen: PropTypes.number,
  }).isRequired,
};

export default ChatCard;