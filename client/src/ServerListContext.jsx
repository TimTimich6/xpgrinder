import React, { createContext, useState } from "react";
const defaultFilter = { filter: "test filter", response: "test reponse" };
const defaultServer = {
  name: "Experimental Server",
  filters: [defaultFilter],
  img: "https://cdn.discordapp.com/icons/934702825328504843/a_83e4af2b89a968743072ad9c57330c80.png?size=4096",
  settings: {
    useAI: false,
    dialogueMode: false,
    reply: false,
  },
  guildID: "313137173",
  tracking: false,
  id: "13189318301",
};
export const ServerListContext = createContext();
export const ServerListProvider = (props) => {
  const [servers, setServers] = useState([defaultServer]);
  const [currentServer, setCurrentServer] = useState(servers.length - 1);
  const [openPopup, setOpenPopup] = useState(false);

  console.log("servers:", servers);
  // console.log('curr:', currentServer);
  // console.log('length:', servers.length);

  return (
    <ServerListContext.Provider value={{ servers, setServers, currentServer, setCurrentServer, setOpenPopup, openPopup }}>
      {props.children}
    </ServerListContext.Provider>
  );
};
