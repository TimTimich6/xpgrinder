import { useContext } from "react";
import "./ServerStats.css";
import SettingsContainer from "./SettingsContainer";
import { UserSettingsContext } from "./UserSettingsContext";
const ServerStats = () => {
  const { token, altToken, setToken, setAltToken, user } = useContext(UserSettingsContext);
  const tokenValid = /[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/g.test(token);
  const alttokenValid = /[A-Za-z\d]{24}\.[\w-]{6}\.[\w-]{27}/g.test(altToken);

  return (
    <div className="settingsTotalContainer">
      <div className="settingsTopContainer">
        <span className="username">{user.username ? user.username + "#" + user.discriminator : "Input Token"}</span>
        <img className="pfp" src={user.username ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` : null} alt="" />
      </div>
      <div className="settingsMiddleContainer">
        <div className="leftSideStats">
          <SettingsContainer label="UserID" output={user.id ? user.id : "N/A"} />
          <SettingsContainer label="Token &#128204;" output={tokenValid ? token.slice(0, 6) + "......" + token.slice(-6) : "N/A"} modify={setToken} />
          <SettingsContainer
            label="Alternative Token"
            output={alttokenValid ? altToken.slice(0, 6) + "......" + altToken.slice(-6) : "N/A"}
            modify={setAltToken}
          />
          <SettingsContainer label="Email Verified" output={user.email ? "Yes" : "No"} />
          <SettingsContainer label="Phone Verified" output={user.phone ? "Yes" : "No"} />
        </div>
      </div>
      <div className="serverBottomContainer" />
    </div>
  );
};

export default ServerStats;
