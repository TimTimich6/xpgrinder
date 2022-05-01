import { useContext, useRef, useState } from "react";
import { ServerListContext } from "./ServerListContext";
import { UserSettingsContext } from "./UserSettingsContext";

import "./Popup.css";
import TextButton from "./TextButton";
import ReactTooltip from "react-tooltip";
import axios from "axios";
const Popup = () => {
  const { setOpenPopup, currentServer, servers, setServers, openPopup } = useContext(ServerListContext);
  const { logged, setError } = useContext(UserSettingsContext);
  const server = servers[currentServer];
  const replyRef = useRef();
  const timeRef = useRef();
  const exactRef = useRef();
  const percentRef = useRef();
  const spamRef = useRef();
  const aiRef = useRef();
  const channelsRef = useRef();
  const giveawayRef = useRef();
  const spontaneityRef = useRef();
  const blacklistRef = useRef();
  const mindelayRef = useRef();
  const maxdelayRef = useRef();
  const [shareStatus, setShareStatus] = useState("");

  const spamOn = server ? server.settings.spamChannel.length == 18 : false;

  const handleCheck = (event) => {
    setServers((prevState) => {
      return prevState.map((server, index) => {
        if (index === currentServer)
          return {
            ...server,
            settings: {
              ...server.settings,
              reply: replyRef.current.checked,
              exactMatch: exactRef.current.checked,
              useAI: aiRef.current.checked,
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
              channels: channelsRef.current.value,
              giveaway: giveawayRef.current.value,
              temperature: parseInt(spontaneityRef.current.value),
              blacklist: blacklistRef.current.value,
              mindelay: parseInt(mindelayRef.current.value),
              maxdelay: parseInt(maxdelayRef.current.value),
            },
          };
        return server;
      });
    });
  };
  const handleShare = async () => {
    await axios
      .post("/api/share", { server, userhash: logged.hash, username: logged.username })
      .then((resp) => {
        console.log("success in sharing");
        setShareStatus("Successfully shared server!");
      })
      .catch((err) => {
        console.log(err.response.data);
        setError({ ...err.response.data });
      });
  };
  return (
    <>
      {server && server.settings && openPopup === true && (
        <div className="popupTotal">
          <ReactTooltip place="top" type="info" effect="float" multiline className="tooltip" />
          <div className="popUpInner">
            <div className="popupHeading">
              <h1 className="popupTitle">
                Server Settings for <strong>{servers[currentServer].name}</strong>
              </h1>
            </div>
            <div className="popupBody">
              <div className="serverSettingContainer">
                <span
                  data-tip="Let AI contribute to responses on messages that aren't filters"
                  className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
                >
                  Assist with AI
                </span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={aiRef}
                  checked={server.settings.useAI}
                  disabled={spamOn}
                />
              </div>

              <div className="serverSettingContainer">
                <span
                  data-tip="How creative and unpredictable AI responses will be"
                  className={`settingsCheckboxLabel ${spamOn || !server.settings.useAI ? "settingDisabled" : null}`}
                >
                  AI Spontaneity
                </span>
                <input
                  type="number"
                  value={server.settings.temperature}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={spontaneityRef}
                  min="0"
                  max="100"
                  step="10"
                  size="3"
                />
              </div>
              <div className="serverSettingContainer">
                <span
                  data-tip="Channel IDs of channels that will be tracked. Separate ids with spaces. Must use with AI"
                  className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
                >
                  Specific Channels
                </span>
                <input
                  type="text"
                  value={server.settings.channels}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={channelsRef}
                  size="20"
                  disabled={spamOn}
                />
              </div>
              <div className="serverSettingContainer">
                <span
                  data-tip="Whether the bot will reply to triggered messages or not"
                  className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
                >
                  Reply
                </span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={replyRef}
                  checked={server.settings.reply}
                  disabled={spamOn}
                />
              </div>
              <div className="serverSettingContainer">
                <span data-tip={`How long will the bot be shown as "typing" before responding (in seconds)`} className={`settingsCheckboxLabel`}>
                  Typing Time
                </span>
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
                <span data-tip="Minimum delay before bot begins typing (in seconds)" className={`settingsCheckboxLabel`}>
                  Minimum delay
                </span>
                <input
                  type="number"
                  value={server.settings.mindelay}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={mindelayRef}
                  min="0"
                  max="120"
                  step="10"
                  size="3"
                />
              </div>
              <div className="serverSettingContainer">
                <span data-tip="Maximum delay before bot begins typing (in seconds)" className={`settingsCheckboxLabel`}>
                  Maximum delay
                </span>
                <input
                  type="number"
                  value={server.settings.maxdelay}
                  className="settingsInput"
                  onChange={(event) => handleInput(event)}
                  ref={maxdelayRef}
                  min="0"
                  max="120"
                  step="10"
                  size="3"
                />
              </div>
              <div className="serverSettingContainer">
                <span
                  data-tip="Checks whether the message matches filter exactly.Only applies to filters"
                  className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
                >
                  Exact Match
                </span>
                <input
                  type="checkbox"
                  className="settingsCheckbox"
                  onChange={(event) => handleCheck(event)}
                  ref={exactRef}
                  checked={server.settings.exactMatch}
                  disabled={spamOn}
                />
              </div>
            </div>
            <div className="serverSettingContainer">
              <span
                data-tip="What is the probability that the bot will respond when a message is triggered"
                className={`settingsCheckboxLabel ${spamOn || server.settings.exactMatch ? "settingDisabled" : null}`}
              >
                Percent Response
              </span>
              <input
                type="number"
                value={server.settings.percentResponse}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={percentRef}
                min="0"
                max="100"
                step="5"
                size="3"
                disabled={spamOn || server.settings.exactMatch}
              />
            </div>
            <div className="serverSettingContainer">
              <span
                data-tip="Enter the channel ID for the channel to spam and delete messages quickly. Separate ids with spaces. Must turn off AI mode"
                className={`settingsCheckboxLabel ${server.settings.spamChannel.length != 18 ? "settingDisabled" : null}`}
              >
                Spam ChannelID
              </span>
              <input
                type="text"
                value={server.settings.spamChannel}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={spamRef}
                size="20"
              />
            </div>
            <div className="serverSettingContainer">
              <span
                data-tip="Enter the channel IDs for the giveaway channel. Separate ids with spaces. Reacts to every message in the channel"
                className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
              >
                Giveaway ChannelID
              </span>
              <input
                type="text"
                value={server.settings.giveaway}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={giveawayRef}
                size="20"
                disabled={spamOn}
              />
            </div>
            <div className="serverSettingContainer">
              <span
                data-tip="User IDs of people you don't want the bot responding to. Separate ids with spaces."
                className={`settingsCheckboxLabel ${spamOn ? "settingDisabled" : null}`}
              >
                Blacklisted Users
              </span>
              <input
                type="text"
                value={server.settings.blacklist}
                className="settingsInput"
                onChange={(event) => handleInput(event)}
                ref={blacklistRef}
                size="30"
                disabled={spamOn}
              />
            </div>
            <div className="popupBottom">
              <div className="popupBottomTop">
                <div className="buttonWrapper" onClick={() => setOpenPopup(false)}>
                  <TextButton bgc="rgb(23, 149, 118)" pd="1rem" fz="2rem">
                    Close Settings
                  </TextButton>
                </div>
                <div className="buttonWrapper" onClick={() => handleShare()}>
                  <TextButton bgc="goldenrod" pd="1rem" fz="2rem">
                    Share Server
                  </TextButton>
                </div>
              </div>
              <div className="popupBottomBottom">
                <h1 className="shareStatus">{shareStatus}</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
