import axios from "axios";
import { useContext, useEffect } from "react";
import { ServerListContext } from "../ServerListContext";
import "./ServerOTD.css";
const ServerOTD = () => {
  const { serverOTD, setServerOTD } = useContext(ServerListContext);
  //   const serverOTD = {
  //     name: "WhitelistAIO",
  //     description: "Best botting tools in the game always updating",
  //     invitelink: "https://discord.gg/Zs7dZanJyu",
  //     guildid: "934702825328504843",
  //     imghash: "92bdbd55c3939be81c290586d06f26a8",
  //   };

  useEffect(() => {
    axios
      .get("/api/serverotd")
      .then((resp) => {
        setServerOTD(resp.data);
      })
      .catch((err) => {
        console.log("error when getting serverOTD;");
      });
  }, []);
  return (
    <>
      {serverOTD && (
        <div className="serverOTD">
          <img src={`https://cdn.discordapp.com/icons/${serverOTD.guildid}/${serverOTD.imghash}.png?size=4096`} alt="" className="serverImg" />
          <div className="rightSideOTD">
            <h1 className="serverOTDText">Server of the Day</h1>
            <h1 className="serverOTDName">{serverOTD.name}</h1>
            <p className="serverDescription">{serverOTD.description}</p>
            <a href={serverOTD.invitelink} target="_blank" className="guildLink">
              {serverOTD.invitelink}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default ServerOTD;
