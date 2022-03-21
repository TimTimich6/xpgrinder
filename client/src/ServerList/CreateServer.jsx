import { useState, useContext } from "react";
import axios from "axios";
import TextButton from "../TextButton";
import { UserSettingsContext } from "../UserSettingsContext";
import { v4 } from "uuid";
const CreateSever = (props) => {
  const [link, setLink] = useState("");
  const { setError, key } = useContext(UserSettingsContext);
  const { setServers, setCurrentServer, servers, setLoading, currentServer } = props;
  const addServer = (server) => {
    setServers((prevState) => [...prevState, server]);
  };
  const deleteServer = async () => {
    if (servers[currentServer].tracking == true) {
      await axios
        .delete("/api/track", {
          data: {
            id: servers[currentServer].id,
            key: key,
          },
        })
        .then((response) => {
          setServers((prevState) => {
            return prevState.map((server, i) => {
              if (i === currentServer) return { ...server, tracking: false };
              return server;
            });
          });
        })
        .catch((err) => {
          console.log("Error when deactivating: ", err.response.data);
          setError({
            title: "Tracking Error",
            description: "Something went wrong when deactivating the tracking",
          });
        });
    }
    setServers((prevState) => {
      return prevState.filter((server, index) => {
        return index !== currentServer;
      });
    });
  };

  const getServerData = async () => {
    const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
    if (invRegex.test(link)) {
      const code = link.slice(19);
      const resp = await axios.get(`/api/invite/${code}`);
      if (resp.data.error) {
        setError({ title: "Invite failed", description: resp.data.error });
        return null;
      }
      // console.log(resp);
      return resp.data;
    }
    return null;
  };
  const handleServerAdd = async () => {
    setLoading(true);
    getServerData()
      .then((resp) => {
        if (resp) {
          addServer({
            name: resp.guildName,
            filters: [],
            img: resp.serverIcon,
            settings: { useAI: false, dialogueMode: false, reply: false },
            guildID: resp.guildID,
            tracking: false,
            id: v4(),
          });
          setCurrentServer(servers.length);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleServerDelete = async () => {
    setLoading(true);
    deleteServer();
    setCurrentServer(servers.length - 2);

    setLoading(false);
  };
  return (
    <>
      <div className="newServerContainer">
        <label className="srWord">Link</label>
        <input onChange={(e) => setLink(e.target.value)} type="text" required className="srText" />
      </div>
      <div className="buttonsServer">
        <div
          className="buttonWrapper"
          onClick={() => {
            handleServerAdd();
          }}
        >
          <TextButton bgc="rgb(23, 149, 118)">Add Server</TextButton>
        </div>
        <div
          className="buttonWrapper"
          onClick={() => {
            handleServerDelete();
          }}
        >
          <TextButton bgc="#BB3C3C">Delete Server</TextButton>
        </div>
      </div>
    </>
  );
};

export default CreateSever;
