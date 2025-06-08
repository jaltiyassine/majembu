import { storageSet } from '../utils/storage';

const STORAGE_KEY = 'ss_storage'; 

export const syncStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  const state = store.getState();

  storageSet({ [STORAGE_KEY]: state })
    .catch(error => {
      console.error("Failed to save state to chrome.storage:", error);
    });

  return result;
};