import axios from "axios";
import { useContext } from "react";
import { ServerListContext } from "../ServerListContext";
import { UserSettingsContext } from "../UserSettingsContext";
const SharedServer = (props) => {
  const { setError } = useContext(UserSettingsContext);
  const { setServers } = useContext(ServerListContext);
  const addServer = (server) => {
    setServers((prevState) => [...prevState, server]);
  };
  const handleCopy = async () => {
    const server = await axios
      .put(`/api/share?uuid=${props.uuid}`)
      .then((resp) => {
        return resp.data;
      })
      .catch((err) => {
        setError({ ...err.response.data });
        return null;
      });
    if (server) {
      console.log(server);
      addServer(server);
    }
  };
  return (
    <div className="sharedServerWrapper">
      <div className="serverOTD">
        <img src={props.imghash} alt="" className="serverImg" />
        <div className="rightSideOTD">
          {/* <h1 className="serverOTDText">{props.}</h1> */}
          <h1 className="serverOTDName">{props.guildname}</h1>
          <p className="serverDescription">{props.guildid}</p>

          <div className="sharedServerUser">
            <img src={`https://cdn.discordapp.com/avatars/${props.userid}/${props.userhash}.png?size=2048`} alt="" className="sharedUserPFP" />
            <h1>{props.username}</h1>
          </div>
          <div className="serverSettingsButton" onClick={handleCopy}>
            Copy Server
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedServer;
