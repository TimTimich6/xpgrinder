import { useContext, useRef, useState } from "react";
import { ServerListContext } from "./ServerListContext";
import "./Popup.css";
import TextButton from "./TextButton";
const Popup = () => {
  const { setOpenPopup, currentServer, servers, setServers, openPopup } = useContext(ServerListContext);
  const server = servers[currentServer];
  // const aiRef = useRef();
  const dialogueRef = useRef();
  const replyRef = useRef();
  const timeRef = useRef();
  const exactRef = useRef();
  const percentRef = useRef();

  const handleCheck = (event) => {
    setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === currentServer)
          return {
            ...server,
            settings: {
              ...server.settings,
              // useAI: aiRef.current.checked,
              dialogueMode: dialogueRef.current.checked,
              reply: replyRef.current.checked,
              exactMatch: exactRef.current.checked,
            },
          };
        return server;
      });
    });
  };
  const handleInput = (event) => {
    setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === currentServer)
          return {
            ...server,
            settings: {
              ...server.settings,
              // useAI: aiRef.current.checked,
              dialogueMode: dialogueRef.current.checked,
              reply: replyRef.current.checked,
              responseTime: parseInt(timeRef.current.value),
              exactMatch: exactRef.current.checked,
              percentResponse: parseInt(percentRef.current.value),
            },
          };
        return server;
      });
    });
  };

  return (
    <>
      {openPopup == true && (
        <div className="popupTotal">
          <div className="popUpInner">
            <div className="popupHeading">
              <h1 className="popupTitle">
                Server Settings for <strong>{servers[currentServer].name}</strong>
              </h1>
            </div>
            <div className="popupBody">
              {/* <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Use AI</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  checked={server.settings.useAI}
                  ref={aiRef}
                />
              </div> */}
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Dialogue Mode (soon)</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={dialogueRef}
                  checked={server.settings.dialogueMode}
                />
              </div>
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Reply</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={replyRef}
                  checked={server.settings.reply}
                />
              </div>
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Response Time</span>
                <input
                  type="number"
                  value={server.settings.responseTime}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={timeRef}
                  min="3"
                  max="10"
                  step="1"
                />
              </div>
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Exact Match</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={exactRef}
                  checked={server.settings.exactMatch}
                />
              </div>
            </div>
            <div className="serverSettingContainer">
              <span className="settingsCheckboxLabel">Percent Response</span>
              <input
                type="number"
                value={server.settings.percentResponse}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={percentRef}
                min="0"
                max="100"
                step="20"
              />
            </div>
            <div className="popupBottom">
              <div className="buttonWrapper" onClick={() => setOpenPopup(false)}>
                <TextButton bgc="rgb(23, 149, 118)" fz="1.7rem">
                  Close Settings
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
