import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import './css/index.css';
import ResponsiveAppBar from './components/appBar';
import CustomTabPanel from './components/subMenu';
import InfoFooter from './components/infoFooter';
import { initializeStore } from './store/store';

import { useDispatch, useSelector } from 'react-redux';
import { addNotif } from './features/notificationsSlice';
import { updateChats } from './features/chatsSlice';
import { changeCurrentPeople, changeTotalChats, changeActionDetails } from './features/dialogueSlice';
import { modifyConfigMessage } from './features/messagesSlice';
import { deleteShiftSubject } from './features/boolsSlice';

const App = () => {
  const dispatch = useDispatch();
  let configMessages = useSelector(state => state.configMessages.configMessages);
  let currentPeople = useSelector(state => state.chats.chats);
  let shiftSubjects = useSelector(state => state.bools.shiftSubjects);
  let user = useSelector(state => state.user.info);

  // constently sync
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.selectedChats) {
      dispatch(updateChats(msg.selectedChats));

    }else if(msg.syncConversation){
      dispatch(modifyConfigMessage(msg.syncConversation));

    }else if(msg.shiftToDelete){
      dispatch(deleteShiftSubject(msg.shiftToDelete));

    }else if(msg.dialogueInfo){
      dispatch(changeActionDetails(msg.dialogueInfo));

    }else if(msg.syncError){
      dispatch(addNotif({
        id: Math.floor(100000 + Math.random() * 900000),
        severity: "error",
        message: msg.syncError,
        dateToShow: 1,
      }));

      const html = document.documentElement;
      html.scrollTop = 0;
    }
  });

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    port.onMessage.addListener(function(msg) {
      if (msg.syncConversation) {
        dispatch(modifyConfigMessage(msg.syncConversation));

      }else if(msg.syncState){
        dispatch(changeActionDetails(msg.syncState));

      }else if (msg.shiftToDeletes) {
        for (const shiftToDeleteID of msg.shiftToDeletes) {
          dispatch(deleteShiftSubject(shiftToDeleteID));
        }

      }else if (msg.syncError) {
        dispatch(addNotif({
          id: Math.floor(100000 + Math.random() * 900000),
          severity: "error",
          message: msg.syncError,
          dateToShow: 1,
        }));

        const html = document.documentElement;
        html.scrollTop = 0;
      }
    });

    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: {type:"changeUser", data: user} });
    });

  }, [user]);

  useEffect(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: {type:"configMessages", data: configMessages} });
    });

  }, [configMessages]);

  useEffect(()=>{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: {type:"shiftSubjects", data: shiftSubjects} });
    });

  }, [shiftSubjects]);

  useEffect(()=>{
    dispatch(changeTotalChats(configMessages.length));
    dispatch(changeCurrentPeople(currentPeople.length));

  }, [configMessages, currentPeople]);

  return (
      <div className="popup">
        <ResponsiveAppBar />
        <CustomTabPanel />
        <InfoFooter />
      </div>
  );
}

async function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
      return;
  }

  const root = ReactDOM.createRoot(rootElement);

  try {
    const store = await initializeStore();

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize the extension:", error);
    root.render(
      <div>
        <p>Error loading the extension.</p>
      </div>
    );
  }
}

init();