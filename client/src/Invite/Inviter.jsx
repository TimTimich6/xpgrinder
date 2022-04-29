import { useState, useContext } from "react";
import { UserSettingsContext } from "../UserSettingsContext";
import InviterOption from "./InviterOption";
import "./Inviter.css";
import axios from "axios";
import TextButton from "../TextButton";
const Inviter = () => {
  const { setLoading, setError, webhook } = useContext(UserSettingsContext);
  const [amount, setAmount] = useState(1);
  const [delay, setDelay] = useState(6);
  const [concurrent, setConcurrent] = useState(true);
  const [verbose, setVerbose] = useState(true);
  const [message, setMessage] = useState("");
  const [guildName, setGuildName] = useState("");
  const [guildID, setGuildID] = useState("");
  const [messageID, setMessageID] = useState("");
  const [channelID, setChannelID] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [serverLogo, setServerLogo] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [reaction, setReaction] = useState("");

  const [captcha, setCaptcha] = useState(1);

  const handleSetLink = () => {
    const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
    if (invRegex.test(inviteLink)) {
      setLoading(true);
      getServerData()
        .then((resp) => {
          if (resp) {
            setServerLogo(resp.serverIcon);
            setGuildName(resp.guildName);
            setGuildID(resp.guildID);
            const linkCode = inviteLink.split(".gg/");
            setInviteCode(linkCode[1]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError({ title: "Link error", description: "Invite link doesn't pass regex" });
    }
  };
  const getServerData = async () => {
    const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
    if (invRegex.test(inviteLink)) {
      const code = inviteLink.slice(19);
      return axios
        .get(`/api/invite/${code}`)
        .then((resp) => resp.data)
        .catch((err) => {
          setError({ ...err.response.data });
        });
    }
    return null;
  };

  const startInviting = async () => {
    const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
    if (!invRegex.test(inviteLink)) return setError({ title: "Link Error", description: "Invite link doesn't pass regex" });

    setLoading(true);
    const data = await axios
      .post("/api/invite", {
        inviteLink,
        amount,
        delay,
        captcha,
        messageID,
        message,
        guildID,
        channelID,
        reaction,
        webhook,
        guildName,
        serverLogo,
        concurrent,
        verbose,
      })
      .catch((err) => setError(err.response.data))
      .finally(() => setLoading(false));
  };

  const stopInviting = async () => {
    setLoading(true);
    const data = await axios
      .delete("/api/invite")
      .catch((err) => setError(err.response.data))
      .finally(() => setLoading(false));
  };
  return (
    <div className="inviterTotal">
      <h1 style={{ color: "white", fontSize: "2rem", marginTop: "1rem" }}>
        Inviter V2 <span className="redText">ALPHA</span>
      </h1>
      <div className="inviterBody">
        {guildID && (
          <div className="guild rounded">
            <img src={serverLogo || "./xpgrinder.png"} alt="" className="guildLogo" />
            <div className="guildMiddle">
              <h1 className="guildName impressive">{guildName || "N/A"}</h1>
              <a href={inviteLink} className="guildLink">
                Code: {inviteCode || "Invite Link"}
              </a>
              <h3 className="guildName">Guild ID: {guildID || "N/A"}</h3>
            </div>
          </div>
        )}
        <div className="newServerContainer">
          <label className="srWord">Invite Link</label>
          <input onChange={(e) => setInviteLink(e.target.value)} type="text" required className="srText" />
        </div>
        <div className="inviterSettingsTotal rounded">
          <h1 style={{ fontSize: "2rem" }}>Inviter Settings</h1>

          <div className="inviterSettings">
            <InviterOption label="Amount">
              <input
                type="number"
                className="optionInput IText"
                min="1"
                max="15"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </InviterOption>
            <InviterOption label="Join Delay">
              <input
                type="number"
                className="optionInput IText"
                min="2"
                max="120"
                step="1"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
              />
            </InviterOption>
            <InviterOption label="Captcha Attempts">
              <input
                type="number"
                className="optionInput IText"
                min="0"
                max="3"
                step="1"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
              />
            </InviterOption>
            <InviterOption label="Concurrent">
              <input type="checkbox" className="optionInput ICheck" checked={concurrent} onChange={() => setConcurrent(!concurrent)} />
            </InviterOption>
            <InviterOption label="Verbose Debugging">
              <input type="checkbox" className="optionInput ICheck" checked={verbose} onChange={() => setVerbose(!verbose)} />
            </InviterOption>
            <InviterOption label="Reaction Emoji">
              <input
                type="text"
                className="optionInput IText"
                size="3"
                maxLength="2"
                value={reaction}
                onChange={(e) => setReaction(e.target.value)}
              />
            </InviterOption>
            <InviterOption label="Message To Send">
              <input type="text" className="optionInput IText" value={message} onChange={(e) => setMessage(e.target.value)} />
            </InviterOption>
            <InviterOption label="MessageID">
              <input
                type="number"
                className="optionInput IText"
                size="18"
                maxLength="18"
                minLength="18"
                value={messageID}
                onChange={(e) => setMessageID(e.target.value)}
              />
            </InviterOption>
            <InviterOption label="channelID">
              <input
                type="number"
                className="optionInput IText"
                size="18"
                maxLength="18"
                minLength="18"
                value={channelID}
                onChange={(e) => setChannelID(e.target.value)}
              />
            </InviterOption>
          </div>
        </div>
        <div className="inviterButtons">
          <div className="buttonWrapper" onClick={(e) => handleSetLink()}>
            <TextButton bgc="#9cb36b" fz="1.6rem">
              Set Link
            </TextButton>
          </div>
          <div className="buttonWrapper" onClick={(e) => startInviting()}>
            <TextButton bgc="rgb(23, 149, 118)" fz="1.6rem">
              Start Invites
            </TextButton>
          </div>
          <div className="buttonWrapper" onClick={(e) => stopInviting()}>
            <TextButton bgc="rgb(187, 60, 60)" fz="1.6rem">
              Cancel Process
            </TextButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inviter;
