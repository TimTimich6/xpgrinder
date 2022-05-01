import CreateSever from "./CreateServer";
import TrackingPreview from "./TrackingPreview";
import { useContext, useState } from "react";
import { ServerListContext } from "../ServerListContext";
import { UserSettingsContext } from "../UserSettingsContext";

const ServerList = () => {
  const { servers, setServers, currentServer, setCurrentServer } = useContext(ServerListContext);
  const { active } = useContext(UserSettingsContext);

  return (
    <div className="serverList">
      <h1 style={{ color: "white", fontSize: "2rem" }}>All Servers</h1>
      <div className={`serversAll ${active ? "active" : null}`}>
        {servers.map((server, index) => {
          return (
            <div
              className="serverTrackerWrapper"
              onClick={() => {
                setCurrentServer(index);
              }}
              key={server.uuid}
            >
              <TrackingPreview
                name={server.name}
                selected={index === currentServer}
                tracking={server.tracking}
                img={server.img}
                setServers={setServers}
                index={index}
              />
            </div>
          );
        })}
      </div>

      <CreateSever servers={servers} setServers={setServers} setCurrentServer={setCurrentServer} currentServer={currentServer} />
    </div>
  );
};

export default ServerList;
