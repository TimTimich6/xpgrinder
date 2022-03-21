import React, { createContext, useState } from "react";
const defaultFilter = { filter: "test filter", response: "test reponse" };
const defaultServer = {
  name: "WhitelistAIO",
  filters: [defaultFilter],
  img: "https://cdn.discordapp.com/icons/934702825328504843/fccaa27ede65334871fb5edf87b44f15.png?size=4096",
  settings: {
    useAI: false,
    dialogueMode: false,
    reply: false,
    responseTime: 5,
  },
  guildID: "934702825328504843",
  tracking: false,
  id: "934702825328504843",
};
export const ServerListContext = createContext();
export const ServerListProvider = (props) => {
  const [servers, setServers] = useState([defaultServer]);
  const [currentServer, setCurrentServer] = useState(servers.length - 1);
  const [openPopup, setOpenPopup] = useState(false);

  console.log("servers:", servers);

  return (
    <ServerListContext.Provider value={{ servers, setServers, currentServer, setCurrentServer, setOpenPopup, openPopup }}>
      {props.children}
    </ServerListContext.Provider>
  );
};
