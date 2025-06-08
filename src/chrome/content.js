class Chat {
  static user = null;

  static arrayOfChats = [];
  static sendingArrayOfChats = [];
  static SavedMessages = [];
  static waitingActions = [];
  static ShiftSubjects = [];

  static isAddButtons = false;
  static addMainButton = true;
  static syncErrorSentThisCycle = false;

  static mainLoopTimeout = null;
  static isSystemRunning = false;

  constructor(id, display_name, insta_username, pp_url, htmlObject) {
    this._id = id;
    this._display_name = display_name;
    this._insta_username = insta_username || null;
    this._pp_url = pp_url;
    this._htmlObject = htmlObject;
  }

  get id() {
    return this._id;
  }

  get display_name() {
    return this._display_name;
  }

  get insta_username() {
    return this._insta_username;
  }

  get pp_url() {
    return this._pp_url;
  }

  get htmlObject() {
    return this._htmlObject;
  }

  set insta_username(username) {
    this._insta_username = username || null;
  }

  check_reply(){
    const isReply = (this._htmlObject).querySelector('span[data-visualcompletion="ignore"] div');
    return isReply? true : false;
  }

  click_person(){
    (this._htmlObject).click();
  }

  add_button(){
    const addSelfButton = (this._htmlObject.querySelector("button.zzzoazaziaz"));
    addSelfButton.textContent = "✔";
    addSelfButton.setAttribute("disabled","");
    setTimeout(()=>{
      const path = window.location.pathname;
      const match = path.match(/\/direct\/t\/(\d+)\//);
      const number = match ? match[1] : null;
      this._insta_username = number;
      
      Chat.sendingArrayOfChats.push(this);
    },500);
  }

  add_add_button(){
    const addingContainer = ((this._htmlObject).firstChild).firstChild;
    const button = document.createElement("button");
    button.textContent = "Add";
    button.id = "I"+this._id;
    button.classList.add("zzzoazaziaz");
    button.onclick = () => this.add_button();
    addingContainer.appendChild(button);
  }

  is_add_button_exist(){
    const button = document.getElementById("I"+this._id);
    return button? true : false;
  }

  static list_new_chats() {
    let chats;
  
    try {
      const chatListContainer = document.querySelector('div[aria-label="Chats"][role="list"]');
      const mainChatListContainer = chatListContainer?.querySelectorAll("div[class='x1n2onr6']")[0];
      chats = mainChatListContainer?.children;
    } catch {
      return;
    }
  
    if (!chats) return;
  
    for (let i = 0; i < chats.length; i++) {
      try {
        const theMainObj = chats[i]?.firstChild?.firstChild;
        if (!theMainObj) continue;
  
        const nameSpan = theMainObj.querySelector('span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft');
        const username = nameSpan ? nameSpan.textContent.trim() : null;
  
        const avatarImg = theMainObj.querySelector('img');
        const avatarUrl = avatarImg ? avatarImg.src : null;
  
        const objChat = new Chat(Chat.uniqid(), username, null, avatarUrl, theMainObj);
  
        if (!theMainObj.querySelector("button") && Chat.isAddButtons && !Chat.sendingArrayOfChats.some(chat => chat.display_name === username)) {
          objChat.add_add_button();
        }
  
        if (!Chat.arrayOfChats.some(chat => chat.display_name === username)) {
          Chat.arrayOfChats.push(objChat);
        }
  
      } catch {
        // do nothing
      }
    }
  }

  static async requestMessage(objMessage) {
    const objToSend = {
      ...objMessage,
      user: Chat.user
    };

    const apiUrl = 'https://gen-hub.fun/';

    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objToSend)
    })
    .then(response => {
      if (!response.ok) {
        if (!Chat.syncErrorSentThisCycle) {
          Chat.syncErrorSentThisCycle = true;
          chrome.runtime.sendMessage({ syncError: response.status });
          chrome.runtime.sendMessage({ dialogueInfo : { state: "none", username: null, emotion:null} });
          Chat.stop();
          Chat.clickDirectMessageButton();
          window.location.reload();
        }
        throw Error();
      }

      return response.json();
    })
    .catch(() => {
      return null;
    });
  }

  static addMainButtonsCtrl(){
    let addCheckContainer;
    let mainCheckContainer;

    try {
      addCheckContainer = document.querySelector("div.x6s0dn4.x78zum5.x1q0g3np.x1nhvcw1.xyinxu5.xxbr6pl.x1a8lsjc.xbbxn1n");
      mainCheckContainer = addCheckContainer.firstChild;
    } catch {
      return;
    }

    mainCheckContainer.innerHTML += '<button style="margin-top:10px" id="zzzeezi">Display add buttons</button>';

    const zzzeezi = document.getElementById("zzzeezi");
    zzzeezi.onclick = () => {
      let text;
      Chat.isAddButtons = !Chat.isAddButtons;
      
      if(Chat.isAddButtons){
        text="Hide add buttons";
        Chat.list_new_chats();
      }else{
        text="Display add buttons";
        const remButtons = document.querySelectorAll("button.zzzoazaziaz");
        remButtons.forEach(element => {
          element.remove();
        })
      }
      zzzeezi.textContent = text;
    }

    Chat.addMainButton = false;
  }

  static is_typing() {
    const typingElement = document.querySelector('div.html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6s0dn4.x78zum5.x1ta3ar0');

    if (!typingElement) {
        return false;
    }

    return true;
  }

  static extractMessagesAfterLastOutgoing_v4() {
    function getComplexTextContent(element) {
      if (!element) return null;
      let fullText = "";
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          fullText += child.nodeValue;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === 'IMG' && child.alt) {
            fullText += child.alt;
          } else if (child.childNodes.length > 0) {
            const nestedText = getComplexTextContent(child);
            if (nestedText) fullText += nestedText;
          } else if (child.textContent) {
            fullText += child.textContent;
          }
        }
      }
      return fullText.trim();
    }

    const userHeaderElement = document.querySelector(
      "h2.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xl565be.x1s688f.x5n08af.x1tu3fi.x3x7a5m.x10wh9bi.x1wdrske.x8viiok.x18hxmgj span.x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft"
    );

    if (!userHeaderElement?.firstChild?.textContent) {
      return [];
    }
    const currentUserName = userHeaderElement.firstChild.textContent.trim();

    function isMyMessage(cell, myName) {
      const senderElement =
        cell.querySelector('h6 > span') ||
        cell.querySelector(':scope > span.html-span.xdj266r:not(:has(div))') ||
        cell.querySelector('div[role="presentation"].html-div > div > h6 > span');

      if (senderElement) {
        return senderElement.textContent.trim() != myName;
      }
      return false;
    }

    const messageCells = Array.from(
      document.querySelectorAll('div[data-scope="messages_table"]')
    ).filter(cell =>
      !cell.querySelector('h5[dir="auto"] div[data-scope="date_break"]') &&
      cell.querySelector('div[id^="mid.$"]')
    );

    if (messageCells.length === 0) {
      return [];
    }

    let lastMyMessageIndex = -1;
    for (let i = messageCells.length - 1; i >= 0; i--) {
      if (isMyMessage(messageCells[i], currentUserName)) {
        lastMyMessageIndex = i;
        break;
      }
    }

    const startIndex = lastMyMessageIndex === -1 ? 0 : lastMyMessageIndex + 1;

    const newIncomingMessages = [];

    for (let i = startIndex; i < messageCells.length; i++) {
      const cell = messageCells[i];

      if (isMyMessage(cell, currentUserName)) {
        continue;
      }

      const messageBubble = cell.querySelector('div[id^="mid.$"]');
      if (messageBubble) {
        const textContentElement =
          messageBubble.querySelector('span[dir="auto"] > div[dir="auto"]') ||
          messageBubble.querySelector('div.x1gslohp') ||
          messageBubble.querySelector('span.x193iq5w > div[dir="auto"]') ||
          messageBubble.querySelector('span[dir="auto"]');

        if (textContentElement) {
          const messageText = getComplexTextContent(textContentElement);
          if (messageText) {
            newIncomingMessages.push(messageText);
          }
        }
      }
    }

    return newIncomingMessages;
  }

  static uniqid(prefix = '', moreEntropy = false) {
    const now = Date.now();
    const sec = Math.floor(now / 1000).toString(16);
    const usec = (now % 1000).toString(16).padStart(3, '0') + Math.floor(Math.random() * 1000).toString(16).padStart(3, '0');
    let id = prefix + sec + usec;
  
    if (moreEntropy) {
      id += (Math.random() * 10).toFixed(8).toString();
    }
  
    return id;
  }

  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static dispatchLexicalEvents(element, inputType = 'insertText', data = null) {
    if (document.activeElement !== element) {
        element.focus();
    }
    let inputEvent;
    try {
        inputEvent = new InputEvent('input', { inputType: inputType, data: data, bubbles: true, cancelable: false, composed: true });
    } catch (e) {
        inputEvent = new Event('input', { bubbles: true, cancelable: false, composed: true });
    }
    element.dispatchEvent(inputEvent);
  }

  static setPlaceHolder(newText = null){
    const selector = 'div.xi81zsa.x17qophe.x6ikm8r.x10wlt62.x47corl.x10l6tqk.xlyipyv.x13vifvy.x87ps6o.xuxw1ft.xh8yej3';
    const messagePlaceholder = document.querySelector(selector);
    if(messagePlaceholder){
      if(newText){
        return messagePlaceholder.textContent = newText;
      }else{
        return messagePlaceholder.textContent;
      }
    }else{
      return null;
    }
  }

  static pasteIntoInstagramInputHTML(textToPaste) {
    const selector = 'div.xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f';
    const messageInput = document.querySelector(selector);
  
    if (messageInput) {
      messageInput.focus();
  
      const textAsHTML = textToPaste.replace(/\n/g, '.');
      messageInput.innerHTML = textAsHTML;
  
      let inputEvent;
      try {
         inputEvent = new InputEvent('input', {
            inputType: 'insertText',
            data: textToPaste,
            bubbles: true,
            cancelable: true
        });
      } catch (e) {
        inputEvent = new Event('input', { bubbles: true, cancelable: true });
      }
      messageInput.dispatchEvent(inputEvent);
  
    }
  }

  static async pasteIntoInstagramInputHTML_animated(finalTextToType) {
    try {
        const selector = 'div.xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f';
        const messageInput = document.querySelector(selector);

        if (!messageInput) { 
            return false; 
        }

        messageInput.focus();

        const selForClear = window.getSelection();
        if (!selForClear) { 
            return false; 
        }
        const rangeForClear = document.createRange();
        try {
            rangeForClear.selectNodeContents(messageInput);
            selForClear.removeAllRanges();
            selForClear.addRange(rangeForClear);
        } catch (e) {
          // do nothing
        }
        
        let clearedViaExec = false;
        if (document.queryCommandSupported && document.queryCommandSupported('selectAll') && document.queryCommandSupported('delete')) {
            try {
                document.execCommand('selectAll', false, null);
                await Chat.sleep(50);
                clearedViaExec = document.execCommand('delete', false, null);
            } catch (e) {
              // do nothing
            }
        }

        if (!clearedViaExec) {
            Chat.dispatchLexicalEvents(messageInput, 'deleteContentBackward', null);
        }
        
        await Chat.sleep(450);

        messageInput.focus(); 

        const processedTextToType = String(finalTextToType).replace(/\n/g, '.');

        if (finalTextToType === null || finalTextToType === undefined) { return true; }
        if (String(processedTextToType).trim() === "") {
            if (!clearedViaExec) Chat.dispatchLexicalEvents(messageInput, 'deleteContentBackward');
            return true;
        }

        const chars = String(processedTextToType).length;

        for (let i = 0; i < chars; i++) {
            const charToInsert = processedTextToType[i];
            
            messageInput.focus(); 
            await Chat.sleep(30);

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                await Chat.sleep(50);
                const selRetry = window.getSelection();
                 if (!selRetry || selRetry.rangeCount === 0) {
                    continue;
                }
            }

            try {
                if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
                    const success = document.execCommand('insertText', false, charToInsert);
                    if (!success) {
                        Chat.dispatchLexicalEvents(messageInput, 'insertText', charToInsert);
                    }
                } else {
                    Chat.dispatchLexicalEvents(messageInput, 'insertText', charToInsert);
                }
            } catch (e) {
                return false; 
            }

            const avgCharsPerSec = 12;
            const variability = 0.4;

            const baseDelayMsForChar = 1000 / avgCharsPerSec;
            const randomFactorForChar = 1 + (Math.random() * 2 - 1) * variability;
            let charDelayMs = Math.round(baseDelayMsForChar * randomFactorForChar);

            if (i < chars - 1) {
                await Chat.sleep(charDelayMs);
            }
        }

        return true;
    } catch (outerError) {
        return false;
    }
  }

  static clickSendButton() {
    const potentialButtons = document.querySelectorAll('div[role="button"]');
    let sendButton = null;
  
    potentialButtons.forEach(button => {
      if (button.innerText.trim() === 'Send') {
        sendButton = button;
      }
    });
  
    if (sendButton) {
      sendButton.click();
  
    }
  }
  
  static clickDirectMessageButton() {
    const selector = 'a[href*="/direct/inbox/"]';
    const buttonElement = document.querySelector(selector);
  
    if (buttonElement) {
      buttonElement.click();
    } else {
      console.error("Direct message button not found using selector:", selector);
    }
  }

  static syncit(){
    for (const chat of Chat.sendingArrayOfChats) {
      if (!chat.insta_username) {
        continue;
      }

      const isUnread = chat.check_reply();

      if (isUnread) {
        let doesExistInMessages = false;
        let messageObject = null;
        for (const message of Chat.SavedMessages) {
          if(message.person.id == chat.insta_username){
            doesExistInMessages = true;
            messageObject = message;
            break;
          }
        }

        if(!doesExistInMessages){
          continue;
        }

        let doesExistInActions = false;
        for (const action of Chat.waitingActions) {
          if(action.person.insta_username == chat.insta_username){
            doesExistInActions = true;
            break;
          }
        }

        if(doesExistInActions){
          continue;
        }

        let seconds = Math.floor(Date.now() / 1000);

        Chat.waitingActions.push({
          id: Chat.uniqid(),
          timestampToSend: seconds + messageObject.replyDelaySeconds,
          person: Chat.sendingArrayOfChats.find((chat) => chat.insta_username == messageObject.person.id),
          message: messageObject,
        });

      }
    }
  }

  static async runMessanger(){
    Chat.waitingActions.sort((a, b) => a.timestampToSend - b.timestampToSend);

    if(document.hidden){
      return;
    }

    for (const action of Chat.waitingActions) {
      let seconds = Math.floor(Date.now() / 1000);
      if(action.timestampToSend > seconds){
        continue;
      }

      action.person.click_person();

      await Chat.sleep(3000);

      let isTyping = Chat.is_typing();
      while(isTyping){
        await Chat.sleep(5000);
        isTyping = Chat.is_typing();
      }
      
      const messageObject = action.message;
      const arrayOfNewMessages = Chat.extractMessagesAfterLastOutgoing_v4();
      let combinedReply = (arrayOfNewMessages.join('\n')).trim();
      combinedReply = (combinedReply == "")? "(Liked your message without replying)" : combinedReply;

      const replyMessage =  {
        source: "from",
        timestamp: seconds,
        content: combinedReply,
        ShiftSubject: null,
        interpretations: {
            generalDescription: "(not generated yet)",
            emotions: { happiness: "(not generated yet)", anger: "(not generated yet)", sadness: "(not generated yet)" },
            score: { satisfaction: "(not generated yet)", love: "(not generated yet)", comfort: "(not generated yet)" },
        }
      }

      for (let i = 0; i < Chat.ShiftSubjects.length; i++) {
        const shift = Chat.ShiftSubjects[i];
        if (shift.conversationID === messageObject.id) {
          replyMessage.ShiftSubject = shift.subject;

          chrome.runtime.sendMessage({ shiftToDelete: shift.conversationID });
          Chat.ShiftSubjects.splice(i, 1);
          break;
        }
      }

      let shouldPushReplyMessage = true;
      if (messageObject.conversation && messageObject.conversation.length > 0) {
        const lastMessageInConversation = messageObject.conversation[messageObject.conversation.length - 1];
        if (lastMessageInConversation.source === "from" && lastMessageInConversation.content === combinedReply) {
          shouldPushReplyMessage = false;
        }
      }

      if (shouldPushReplyMessage) {
        (messageObject.conversation).push(replyMessage);
      }
      
      const stateName = (messageObject.person.realname == 555)? messageObject.person.display_name : messageObject.person.realname;
      const currentPlaceholder = Chat.setPlaceHolder();
      if(currentPlaceholder){
        Chat.setPlaceHolder("Generating...");
      }
      chrome.runtime.sendMessage({ dialogueInfo : { state: "generating", username: stateName, emotion: null } });

      await Chat.requestMessage(messageObject)
        .then(async newMessage => {
          if (newMessage === null) {
            return; 
          }

          if (messageObject.conversation.length > 0) {
            messageObject.conversation[messageObject.conversation.length - 1].interpretations = (newMessage.lastMessageEvaluations).interpretations;
          }

          (messageObject.conversation).push({
            source: "to",
            timestamp: seconds,
            content: newMessage.content,
            interpretations: newMessage.interpretations
          });

          messageObject.emotions = ((newMessage.lastMessageEvaluations).interpretations).emotions;
          messageObject.score = ((newMessage.lastMessageEvaluations).interpretations).score;

          messageObject.lastSeen = Date.now();
          
          chrome.runtime.sendMessage({ syncConversation: messageObject });

          let maxFoundValue = 70;
          let dominantCharacteristic = null;

          const interpretations = (newMessage.lastMessageEvaluations).interpretations;

          if (interpretations) {
              const emotions = interpretations.emotions || {};
              const score = interpretations.score || {};

              if (emotions.happiness > maxFoundValue) {
                  maxFoundValue = emotions.happiness;
                  dominantCharacteristic = "happy";
              }

              if (emotions.anger > maxFoundValue) {
                  maxFoundValue = emotions.anger;
                  dominantCharacteristic = "angry";
              }

              if (emotions.sadness > maxFoundValue) {
                  maxFoundValue = emotions.sadness;
                  dominantCharacteristic = "sad";
              }

              if (score.satisfaction > maxFoundValue) {
                  maxFoundValue = score.satisfaction;
                  dominantCharacteristic = "satisfied";
              }

              if (score.love > maxFoundValue) {
                  maxFoundValue = score.love;
                  dominantCharacteristic = "loving";
              }

              if (score.comfort > maxFoundValue) {
                  maxFoundValue = score.comfort;
                  dominantCharacteristic = "comfortable";
              }

              if (dominantCharacteristic !== null) {
                  chrome.runtime.sendMessage({
                      dialogueInfo: {
                          state: "notice",
                          username: stateName,
                          emotion: dominantCharacteristic
                      }
                  });
              }
          }

          const finalText = newMessage.content;

          const chars = finalText.length;

          if (chars === 0) {
              Chat.pasteIntoInstagramInputHTML("");
              return;
          }

          const finalTypingResult = await Chat.pasteIntoInstagramInputHTML_animated(finalText);

          if(!finalTypingResult){
            const avgCharsPerSec = 5;
            const variability = 0.2;

            const baseDelayMs = chars / avgCharsPerSec * 1000;
            const randomFactor = 1 + (Math.random() * 2 - 1) * variability;
            let totalTypingDelayMs = Math.round(baseDelayMs * randomFactor);

            Chat.pasteIntoInstagramInputHTML(finalText);
            await Chat.sleep(totalTypingDelayMs);

          }else{
            await Chat.sleep(100);
          }

          Chat.clickSendButton();
          await Chat.sleep(2000);

          Chat.clickDirectMessageButton();

          chrome.runtime.sendMessage({ dialogueInfo : { state: "none", username: null, emotion:null} });
          if(currentPlaceholder){
            Chat.setPlaceHolder(currentPlaceholder);
          }

          Chat.waitingActions = Chat.waitingActions.filter(item => item.id !== action.id);
        })
        .catch(() => {
          // do nothing
        });
    }
  }

  static async runLoop() {
    try {
        Chat.isSystemRunning = true;
        Chat.list_new_chats();

        if (Chat.addMainButton && !document.getElementById("zzzeezi")) {
            Chat.addMainButtonsCtrl();
        }

        chrome.runtime.sendMessage({ selectedChats: Chat.sendingArrayOfChats });

        Chat.syncit();
        if(Chat.waitingActions.length != 0){
          await Chat.runMessanger();
        }

    } catch (error) {
        console.error("Error in Chat main loop:", error);
    } finally {
        Chat.mainLoopTimeout = setTimeout(Chat.runLoop, 500);
        Chat.isSystemRunning = false;
    }
  }

  static async run() {
    const zzzeezi = document.getElementById("zzzeezi");

    if(zzzeezi){
      zzzeezi.style.display = "block";
    }else{
      Chat.addMainButtonsCtrl();
    }
    
    if (Chat.mainLoopTimeout) {
      clearTimeout(Chat.mainLoopTimeout);
    }
    console.log("Starting Chat loop listening...");
    await Chat.runLoop();
  }

  static stop() {
      console.log("Stopping Chat loop listening...");

      if (Chat.mainLoopTimeout) {
        clearTimeout(Chat.mainLoopTimeout);
        Chat.mainLoopTimeout = null;
      }

      if (Chat.isSystemRunning) {
        Chat.isSystemRunning = false;
      }

      const zzzeezi = document.getElementById("zzzeezi");
      if(zzzeezi){
        zzzeezi.style.display = "none";
      }else{
        Chat.addMainButtonsCtrl();
        const zzzeezi2 = document.getElementById("zzzeezi");
        zzzeezi2.style.display = "none";
      }

      const remButtons = document.querySelectorAll("button.zzzoazaziaz");
      remButtons.forEach(element => {
        element.remove();
      });
  }
}

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.action === "start") {
    await Chat.run();

  } else if (request.action === "stop") {
    Chat.stop();

  } else if (typeof request.action == "object") {
    const UFOobject = request.action;
    let igM32;
    switch (UFOobject.type) {
      case "configMessages":
        Chat.SavedMessages = UFOobject.data; break;
      case "shiftSubjects":
        Chat.ShiftSubjects = UFOobject.data; break;
      case "changeUser":
        Chat.user = {
          name: (UFOobject.data).name,
          age: (UFOobject.data).age,
          gender: (UFOobject.data).gender,
          description: (UFOobject.data).description,
          API_KEY: null
        };
        igM32 = localStorage.getItem(`ig${"_"}m32`);
        if (igM32 != null && igM32 != (UFOobject.data).API_KEY) {
          const objToSend = {
            API_KEX: igM32,
            API_KEY: (UFOobject.data).API_KEY
          };

          await fetch("https://gen-hub.fun/m_u.php", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(objToSend)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error();
            }
            return response.json();
          })
          .then(data => {
            if (data && data.success === true) {
              Chat.user.API_KEY = (UFOobject.data).API_KEY;
              localStorage.setItem(`ig${"_"}m32`, (UFOobject.data).API_KEY);
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            Chat.user.API_KEY = igM32;
            return null;
          });
        } else {
          Chat.user.API_KEY = (UFOobject.data).API_KEY;
          if(igM32 == null){
            localStorage.setItem(`ig${"_"}m32`, (UFOobject.data).API_KEY);
          }
        }
        break;
    }

  } else if (request.action === "majembuChatTick") {
      if (Chat.mainLoopTimeout && !Chat.isSystemRunning) {
        clearTimeout(Chat.mainLoopTimeout);
        Chat.mainLoopTimeout = null;
        await Chat.runLoop();
      }
  }
  return true;
});