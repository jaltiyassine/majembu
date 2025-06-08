const STORAGE_KEYS = {
  SHIFT_TO_DELETES: 'shiftToDeletes',
  SYNC_CONVERSATION: 'syncConversation',
  SYNC_STATE: 'syncState',
  SYNC_ERROR: 'syncError'
};

const CHAT_TICK_ALARM_NAME = "majembuChatTickGlobal";

async function getStoredData(key) {
  const result = await chrome.storage.local.get(key);
  return result[key];
}

async function setStoredData(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

async function clearStoredData(key) {
  return chrome.storage.local.remove(key);
}

async function getAllInstagramTabs() {
  return await chrome.tabs.query({ url: "https://www.instagram.com/direct/*" });
}

chrome.alarms.get(CHAT_TICK_ALARM_NAME, (existingAlarm) => {
    if (!existingAlarm) {
        chrome.alarms.create(CHAT_TICK_ALARM_NAME, {
            delayInMinutes: 0,
            periodInMinutes: 1,
        });
    }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === CHAT_TICK_ALARM_NAME) {
    const tabs = await getAllInstagramTabs();
    if (tabs.length > 0) {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: "majembuChatTick" })
            .catch(() => {
              // do nothing
            });
        }
      }
    }
  }
});

let popupPort = null;

chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name === "popup") {
    popupPort = port;

    const pendingShiftToDeletes = await getStoredData(STORAGE_KEYS.SHIFT_TO_DELETES) || [];
    if (pendingShiftToDeletes.length > 0) {
      try { popupPort.postMessage({ shiftToDeletes: pendingShiftToDeletes }); } catch (e) {/* do nothing */}
      await clearStoredData(STORAGE_KEYS.SHIFT_TO_DELETES);
    }

    const pendingSyncConversation = await getStoredData(STORAGE_KEYS.SYNC_CONVERSATION);
    if (pendingSyncConversation) {
      try { popupPort.postMessage({ syncConversation: pendingSyncConversation }); } catch (e) {/* do nothing */}
      await clearStoredData(STORAGE_KEYS.SYNC_CONVERSATION);
    }

    const pendingSyncState = await getStoredData(STORAGE_KEYS.SYNC_STATE);
    if (pendingSyncState) {
      try { popupPort.postMessage({ syncState: pendingSyncState }); } catch (e) {/* do nothing */}
      await clearStoredData(STORAGE_KEYS.SYNC_STATE);
    }

    const pendingSyncError = await getStoredData(STORAGE_KEYS.SYNC_ERROR);
    if (pendingSyncError) {
      try { popupPort.postMessage({ syncError: pendingSyncError }); } catch (e) {/* do nothing */}
      await clearStoredData(STORAGE_KEYS.SYNC_ERROR);
    }

    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

async function handleStorageForMessage(msg) {
    if (msg.syncConversation) {
      await setStoredData(STORAGE_KEYS.SYNC_CONVERSATION, msg.syncConversation);
    } else if (msg.shiftToDelete) {
      const existingDeletes = await getStoredData(STORAGE_KEYS.SHIFT_TO_DELETES) || [];
      if (!existingDeletes.includes(msg.shiftToDelete)){
          existingDeletes.push(msg.shiftToDelete);
      }
      await setStoredData(STORAGE_KEYS.SHIFT_TO_DELETES, existingDeletes);
    } else if (msg.dialogueInfo) {
      await setStoredData(STORAGE_KEYS.SYNC_STATE, msg.dialogueInfo);
    } else if (msg.syncError) {
      await setStoredData(STORAGE_KEYS.SYNC_ERROR, msg.syncError);
    }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (popupPort) {
    try {
        popupPort.postMessage(msg);
    } catch(e) {
        popupPort = null;
        await handleStorageForMessage(msg);
    }
  } else {
    await handleStorageForMessage(msg);
  }
  return true;
});