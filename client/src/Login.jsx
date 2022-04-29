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
    const url = `${window.location.protocol}//${window.location.hostname + ":3080/api/auth/discord"}`;
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
          <div className="buttonWrapper" onClick={() => handleDiscord()}>
            <TextButton bgc="green" fz="6rem" pd="5rem">
              Discord Sign In
            </TextButton>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
