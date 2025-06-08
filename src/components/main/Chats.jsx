import '../../css/chats.css';
import * as React from 'react';
import { useSelector } from 'react-redux';

// components
import ChatCard from '../chatCard';

export default function Chats(){
  let configMessages = useSelector(state => state.configMessages.configMessages);

  return (
    <main className='chats'>
    <ul className="people-list">
    {configMessages && configMessages.length > 0 ? (
      configMessages.map((chat) => (
        <ChatCard key={chat.id} chat={chat} />
      ))
    ) : (
      <li className="empty-list-item">
        No Chats found.
      </li>
    )}
    </ul>
    </main>
  );
}