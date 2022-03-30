import { useContext, useRef } from "react";
import { ServerListContext } from "./ServerListContext";
import "./Popup.css";
import TextButton from "./TextButton";
const Popup = () => {
  const { setOpenPopup, currentServer, servers, setServers, openPopup } = useContext(ServerListContext);
  const server = servers[currentServer];
  const dialogueRef = useRef();
  const replyRef = useRef();
  const timeRef = useRef();
  const exactRef = useRef();
  const percentRef = useRef();
  const spamRef = useRef();
  const spamOn = server ? server.settings.spamChannel.length == 18 : false;

  const handleCheck = (event) => {
    setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === currentServer)
          return {
            ...server,
            settings: {
              ...server.settings,
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
              responseTime: parseInt(timeRef.current.value),
              percentResponse: parseInt(percentRef.current.value),
              spamChannel: spamRef.current.value,
            },
          };
        return server;
      });
    });
  };

  return (
    <>
      {server && server.settings && openPopup === true && (
        <div className="popupTotal">
          <div className="popUpInner">
            <div className="popupHeading">
              <h1 className="popupTitle">
                Server Settings for <strong>{servers[currentServer].name}</strong>
              </h1>
            </div>
            <div className="popupBody">
              <div className="serverSettingContainer">
                <span className={`settingsCheckboxLabel settingDisabled`}>Dialogue Mode (soon)</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={dialogueRef}
                  checked={server.settings.dialogueMode}
                />
              </div>
              <div className="serverSettingContainer">
                <span className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}>Reply</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={replyRef}
                  checked={server.settings.reply}
                />
              </div>
              <div className="serverSettingContainer">
                <span className={`settingsCheckboxLabel`}>Typing Time</span>
                <input
                  type="number"
                  value={server.settings.responseTime}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={timeRef}
                  min="0"
                  max="120"
                  step="10"
                  size="3"
                />
              </div>
              <div className="serverSettingContainer">
                <span className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}>Exact Match</span>
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
              <span className={`settingsCheckboxLabel ${spamOn || server.settings.exactMatch ? "settingDisabled" : null}`}>Percent Response</span>
              <input
                type="number"
                value={server.settings.percentResponse}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={percentRef}
                min="0"
                max="100"
                step="20"
                size="3"
              />
            </div>
            <div className="serverSettingContainer">
              <span className="settingsCheckboxLabel">Spam Channel ID</span>
              <input
                type="text"
                value={server.settings.spamChannel}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={spamRef}
                size="20"
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
