import { useState, useContext } from "react";
import axios from "axios";
import TextButton from "../TextButton";
import { UserSettingsContext } from "../UserSettingsContext";
import { v4 } from "uuid";
const CreateSever = (props) => {
  const [link, setLink] = useState("");
  const { setError, token, setLoading, setActive, active, user, webhook } = useContext(UserSettingsContext);
  const { setServers, setCurrentServer, servers, currentServer } = props;
  const addServer = (server) => {
    setServers((prevState) => [...prevState, server]);
  };
  const deleteServer = () => {
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
      return axios
        .get(`/api/invite/${code}`)
        .then((resp) => resp.data)
        .catch((err) => {
          setError({ ...err.response.data });
        });
    } else if (link.match(/^\d{18}[:].+$/)) {
      const split = link.split(":");
      return {
        guildID: split[0],
        guildName: split[1],
        serverIcon: "./xpgrinder.png",
      };
    }
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
            settings: {
              dialogueMode: false,
              reply: false,
              responseTime: 5,
              exactMatch: false,
              percentResponse: 6,
              spamChannel: "",
              useAI: true,
              channels: "",
              giveaway: "",
              temperature: 20,
              blacklist: "",
              mindelay: 5,
              maxdelay: 20,
            },
            guildID: resp.guildID,
            tracking: false,
            uuid: v4(),
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
    const newServers = servers.filter((server, index) => {
      return index !== currentServer;
    });
    deleteServer();
    console.log("new servers", newServers);
    const data = await axios
      .delete("/api/servers", { data: { servers: newServers } })
      .then((resp) => {
        return resp.data;
      })
      .catch((err) => setError({ ...err.response.data }));
    console.log(data);

    setCurrentServer(newServers.length - 1);
    setLoading(false);
  };

  const handleTracking = async () => {
    setLoading(true);
    if (!active) {
      const data = await axios
        .post("/api/track", {
          token,
          servers,
          active: true,
          userid: user.id,
          webhook: webhook,
        })
        .then((resp) => {
          setActive(true);
          return resp.data;
        })
        .catch((err) => setError({ ...err.response.data }));
      console.log(data);
    } else {
      const data = await axios
        .delete("/api/track", { data: { servers } })
        .then((resp) => {
          return resp.data;
        })
        .catch((err) => setError({ ...err.response.data }));
      if (data) console.log(data);
      setActive(false);
    }
    setLoading(false);
  };
  const handlePower = async () => {
    setLoading(true);
    try {
      const data = await axios
        .delete("/api/track", { data: { servers } })
        .then((resp) => {
          return resp.data;
        })
        .catch((err) => setError({ ...err.response.data }));
      if (data) console.log(data);
      setActive(false);
    } catch (error) {
      setError({ ...error.response.data });
    }
    setLoading(false);
  };
  return (
    <>
      <div className="newServerContainer">
        <label
          className="srWord"
          data-tip={`Insert invite link (preffered) or in the format of guild id:nick name. For example, 934702825328504843:Test Server `}
        >
          Link/ID
        </label>
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
        <div
          className="buttonWrapper"
          onClick={() => {
            handleTracking();
          }}
        >
          <TextButton bgc={!active ? "#BDB76B" : "gray"}>{!active ? "Track Selected" : "Stop Tracking"}</TextButton>
        </div>
        <img src="./poweroff.png" alt="" className="forcePower" data-tip="forced turnoff" onClick={handlePower} />
      </div>
    </>
  );
};

export default CreateSever;
