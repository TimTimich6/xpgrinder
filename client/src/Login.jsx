import { useContext, useEffect } from "react";
import { UserSettingsContext } from "./UserSettingsContext";
import { ServerListContext } from "./ServerListContext";
import "./Login.css";
import TextButton from "./TextButton";

const Login = () => {
  const { logged, setToken, setWebhook, setActive } = useContext(UserSettingsContext);
  const { setServers } = useContext(ServerListContext);
  const handleDiscord = async () => {
    console.log("protocol", window.location.protocol);
    console.log("protocol", window.location.hostname);
    const url = window.location.protocol == "http:" ? "http://localhost:3080/api/auth/discord" : "https://xpgrinder.xyz/api/auth/discord";
    window.location.href = url;
  };
  useEffect(() => {
    console.log(logged);
    if (logged.userid) {
      setToken(logged.token);
      setServers(logged.servers);
      setWebhook(logged.webhook);
      setActive(logged.active);
    }
  }, [logged]);
  return (
    <>
      {!logged.userid && (
        <div className="bcgFull">
          <h1 className="newsText">Contact timlol#4634 about critical bugs</h1>
          <div className="introduction">
            <h1 className="welcomeText">Welcome to XPGRINDER</h1>
            <p className="welcomeDesc">XPGRINDER is avaliable to all holders of a WhitelistAIO NFT</p>
          </div>
          <div className="buttonWrapper" onClick={() => handleDiscord()}>
            <TextButton bgc="#7289DA" fz="6rem" pd="5rem">
              Discord Sign In
            </TextButton>
          </div>
          <div className="mediasContainer">
            <div className="media">
              <a href="https://discord.gg/Zs7dZanJyu" className="media" target="_blank">
                <img src="pixeldiscord.png" alt="discord" className="discordLogo logo" />
                <span className="mediaText">Discord</span>
              </a>
            </div>
            <div>
              <a href="https://twitter.com/WhitelistAIO_" className="media" target="_blank">
                <img src="pixeltwitter.png" alt="twitter" className="twitterLogo logo" />
                <span className="mediaText">Twitter</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
