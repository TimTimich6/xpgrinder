import CreateSever from "./CreateServer";
import TrackingPreview from "./TrackingPreview";
import { useContext, useState } from "react";
import { ServerListContext } from "../ServerListContext";
import { UserSettingsContext } from "../UserSettingsContext";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const ServerList = (props) => {
  const { servers, setServers, currentServer, setCurrentServer } = useContext(ServerListContext);
  const { token, user, setError, key } = useContext(UserSettingsContext);
  const [loading, setLoading] = useState(false);

  const handleTracking = async () => {
    if (!servers[currentServer].tracking) {
      axios
        .post(
          "/api/track",
          {
            guildID: servers[currentServer].guildID,
            filters: servers[currentServer].filters,
            userID: user.id,
            token: token,
            settings: servers[currentServer].settings,
            id: servers[currentServer].id,
          },
          {
            headers: {
              "testing-key": key,
            },
          }
        )
        .then(() => {
          setServers((prevState) => {
            return prevState.map((server, i) => {
              if (i === currentServer) return { ...server, tracking: true };
              return server;
            });
          });
        })
        .catch((error) => {
          const errorData = error.response.data;
          console.error(errorData);
          setError({ ...errorData });
        });
    } else {
      axios
        .delete("/api/track", {
          data: {
            id: servers[currentServer].id,
          },
          headers: {
            "testing-key": key,
          },
        })
        .then(() => {
          setServers((prevState) => {
            return prevState.map((server, i) => {
              if (i === currentServer) return { ...server, tracking: false };
              return server;
            });
          });
        })
        .catch((err) => {
          console.log("Error when deactivating: ", err.response.data);
          setError({ ...err.response.data });
        });
    }
  };
  return (
    <div className="serverList">
      <h1 style={{ color: "white", fontSize: "2rem", marginTop: "1rem" }}>All Servers</h1>
      {loading === true ? <div className="loader" /> : null}
      {servers.map((server, index) => {
        return (
          <div
            className="serverTrackerWrapper"
            onClick={() => {
              setCurrentServer(index);
            }}
            key={server.id}
          >
            <TrackingPreview
              name={server.name}
              selected={index === currentServer}
              tracking={server.tracking}
              img={server.img}
              setServers={setServers}
              index={index}
              handleTracking={handleTracking}
            />
          </div>
        );
      })}
      <CreateSever
        servers={servers}
        setServers={setServers}
        setCurrentServer={setCurrentServer}
        setLoading={setLoading}
        currentServer={currentServer}
      />
    </div>
  );
};

export default ServerList;
