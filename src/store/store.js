import { configureStore } from '@reduxjs/toolkit';
import notificationsSlice from '../features/notificationsSlice';
import dialogueSlice from '../features/dialogueSlice';
import boolsSlice from '../features/boolsSlice';
import chatsSlice from '../features/chatsSlice';
import configMessagesSlice from '../features/messagesSlice';
import userSlice from '../features/userSlice';
import { syncStorageMiddleware } from './syncStorageMiddleware';
import { storageGet } from '../utils/storage';

const STORAGE_KEY = 'ss_storage';

const rootReducer = {
  notifications: notificationsSlice,
  dialogue: dialogueSlice,
  bools: boolsSlice,
  chats: chatsSlice,
  configMessages: configMessagesSlice,
  user: userSlice
};

export const initializeStore = async () => {
  let preloadedState = undefined;

  try {
    const persistedData = await storageGet(STORAGE_KEY);
    if (persistedData && persistedData[STORAGE_KEY]) {
      preloadedState = persistedData[STORAGE_KEY];
    } else {
       console.log('No preloaded state found in storage.');
    }
  } catch (error) {
    console.error('Failed to load state from chrome.storage:', error);
  }

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(syncStorageMiddleware),
    preloadedState,
  });

  return store;
};