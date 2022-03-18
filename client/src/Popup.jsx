import { useContext, useRef } from "react";
import { ServerListContext } from "./ServerListContext";
import "./Popup.css";
import TextButton from "./TextButton";
const Popup = () => {
  const { setOpenPopup, currentServer, servers, setServers, openPopup } = useContext(ServerListContext);
  const server = servers[currentServer];
  const aiRef = useRef();
  const dialogueRef = useRef();
  const replyRef = useRef();

  const handleCheck = (event) => {
    setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === currentServer)
          return {
            ...server,
            settings: {
              ...server.settings,
              useAI: aiRef.current.checked,
              dialogueMode: dialogueRef.current.checked,
              reply: replyRef.current.checked,
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
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Use AI</span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  checked={server.settings.useAI}
                  ref={aiRef}
                />
              </div>
              <div className="serverSettingContainer">
                <span className="settingsCheckboxLabel">Dialogue Mode</span>
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

{
  /* <div className="popupBody">
  <div className="aiSettingContainer">
    <span className="aiCheckboxLabel">Use AI</span>
    <input type="checkbox" className="settingCheckbox" onChange={(event) => handleCheck(event)} checked={props.settings.useAI} ref={aiRef} />
  </div>
  <div className="aiSettingContainer">
    <span className="aiCheckboxLabel">Dialogue Mode</span>
    <input
      type="checkbox"
      className="settingCheckbox"
      onChange={(event) => handleCheck(event)}
      ref={dialogueRef}
      checked={props.settings.dialogueMode}
    />
  </div>
</div>; */
}
