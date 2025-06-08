import React from 'react';
import PropTypes from 'prop-types';

import { useSelector, useDispatch } from 'react-redux';
import { setTabIndex, setTabParam } from '../features/boolsSlice';

import '../css/person.css';

function PersonCard({ person }) {
  if (!person) {
    return null;
  }

  const dispatch = useDispatch();
  let IDs = useSelector(state => state.configMessages.IDs);
  
  const handleInfoClick = (e) => {
    e.stopPropagation();
    dispatch(setTabParam(person));
    dispatch(setTabIndex(3));
  };

  return (
    <li className="person-item">
      <img
        src={person.pp_url || null}
        alt={`Profile picture of ${person.display_name}`}
        className="person-pp"
      />
      <div className="person-details">
        <h3 className="person-name">{person.display_name}</h3>
        {person.id && (
          <span
            className="person-insta"
            onClick={() => chrome.tabs.create({ url: `https://www.instagram.com/direct/t/${person.id}` })}
            role="button"
          >
            @{person.id}
          </span>
        )}
      </div>
      {
        (IDs.includes(person.id))? null : <button className='info' onClick={handleInfoClick} title={`More info about ${person.display_name}`}>Set up a message ➤</button>
      }
    </li>
  );
}

PersonCard.propTypes = {
  person: PropTypes.shape({
    id: PropTypes.string,
    display_name: PropTypes.string.isRequired,
    pp_url: PropTypes.string,
  }).isRequired,
};

export default PersonCard;