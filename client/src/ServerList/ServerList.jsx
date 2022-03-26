import CreateSever from "./CreateServer";
import TrackingPreview from "./TrackingPreview";
import { useContext, useState } from "react";
import { ServerListContext } from "../ServerListContext";
import { UserSettingsContext } from "../UserSettingsContext";
import axios from "axios";

const ServerList = () => {
  const { servers, setServers, currentServer, setCurrentServer } = useContext(ServerListContext);
  const { token, user, setError, key, setLoading } = useContext(UserSettingsContext);

  const handleTracking = async () => {
    setLoading(true);
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
        })
        .finally(() => {
          setLoading(false);
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
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  return (
    <div className="serverList">
      <h1 style={{ color: "white", fontSize: "2rem", marginTop: "1rem" }}>All Servers</h1>
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
      <CreateSever servers={servers} setServers={setServers} setCurrentServer={setCurrentServer} currentServer={currentServer} />
    </div>
  );
};

export default ServerList;
