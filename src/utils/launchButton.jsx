import '../css/launchbutton.css';
import * as React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { changeDialogue } from '../features/dialogueSlice';
import { setButtonState, setTabIndex, setFirstTime } from '../features/boolsSlice';
import { addNotif } from '../features/notificationsSlice';

export default function LaunchButton(props){
    let buttonState = useSelector(state => state.bools.buttonState);
    let isFirstTime = useSelector(state => state.bools.isFirstTime);
    let isLogged = useSelector(state => ((state.user).info).isSet);

    const [active, setActive] = React.useState(buttonState);
    const [disabled, setDisabled] = React.useState(false);
    const dispatch = useDispatch();
    const [isFailedTab, setIsFailedTab] = React.useState(false);
    const [failedCount, setFailedCount] = React.useState(0);

    const mainSystem = () => {
      if (disabled) return;

      if(!active){
        setActive(true);
        dispatch(setButtonState(true));
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          if (tabs && tabs[0] && tabs[0].id !== undefined) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "start" }).catch(error => {
                console.error("Error sending 'start' message:", error);
                setIsFailedTab(true);
                dispatch(setButtonState(false));
                setActive(false);
            });
          }
        });

      } else {
        setActive(false);
        dispatch(setButtonState(false));
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         if (tabs && tabs[0] && tabs[0].id !== undefined) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "stop" }).catch(error => {
                console.error("Error sending 'stop' message:", error);
            });
          }
        });
      }
    }

    React.useEffect(()=>{
      // check if the user is logged in
      if(!isLogged){
        dispatch(setTabIndex(6));
        return;
      }

      // check if the current location is instagram.com/direct/ | else show message
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.url || !(activeTab.url).includes("https://www.instagram.com/direct/")) {
          setDisabled(true);
          dispatch(setButtonState(false));
          dispatch(changeDialogue(0));

        } else {
          setDisabled(false);
          if(active){
            // -finally display dashboard-
            if(isFirstTime){
              dispatch(setFirstTime(false));
            }
            
            dispatch(changeDialogue(2));
          } else {
            if(isFirstTime){
              dispatch(changeDialogue(1));
            }else{
              if(isFailedTab){
                dispatch(changeDialogue(3));
                props.triggerErrorShake();
                setIsFailedTab(false);
                setFailedCount(failedCount + 1);
              }else{
                dispatch(changeDialogue("Click Start!"));
              }
            }
          }
        }
      });

    }, [active, dispatch]);

    const handleClick = () => {
        if (disabled) {
            props.triggerErrorShake();
        } else {
          if(failedCount >= 3){
            dispatch(addNotif({
              id: Math.floor(100000 + Math.random() * 900000),
              severity: "error",
              message: "If you don't see the buttons added to the inbox after clicking, try refreshing the page.",
              dateToShow: 2,
            }));
            
            setFailedCount(0);
          }
          mainSystem();
        }
    };

    return (
      <div className="content" onClick={handleClick}>
          <div className="round-container">
              <span className={`round-content ${active ? "round-content-active" : ""} ${disabled ? "round-content-disabled" : ""}`}>
                  {active ? "Stop" : "Start"}
              </span>
          </div>
      </div>
    );
}

LaunchButton.propTypes = {
  triggerErrorShake: PropTypes.func.isRequired
};