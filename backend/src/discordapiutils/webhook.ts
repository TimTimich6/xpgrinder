import { Guild } from "./invitetoken";
import { Server } from "./websocket";
import axios from "axios";
import { userData } from "./selfData";
import commonHeaders, { getCookie } from "./headers";

export default class WebHooks {
  readonly token;
  readonly url;
  user: userData;
  constructor(token: string, url: string, user: userData) {
    this.token = token;
    this.url = url;
    this.user = user;
  }
  sendEvent = (title: number | string, description: string, color: string) => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const decimalColor = parseInt(color, 16);
    const body = {
      content: null,
      embeds: [
        {
          title: "WebSocket Event",
          description: description,
          color: decimalColor,
          fields: [
            {
              name: "Event",
              value: title,
            },
          ],
          author: {
            name: this.user.username,
            url: "https://xpgrinder.xyz/",
            icon_url: `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png?size=4096`,
          },
          footer: {
            text: time,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
    };
    const jsonToSend = JSON.stringify(body);
    axios.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err: ", err.response.data));
  };

  sendUser = () => {
    const body = {
      content: null,
      embeds: [
        {
          title: this.token.substring(0, 6) + "...",
          color: parseInt("A414F1", 16),
          fields: [
            {
              name: "Username",
              value: this.user?.username + "#" + this.user?.discriminator,
            },
            {
              name: "User ID",
              value: this.user?.id,
            },
            {
              name: "Verified",
              value: this.user?.verified,
            },
          ],
          author: {
            name: this.user?.username,
            url: "https://xpgrinder.xyz/",
            icon_url: `https://cdn.discordapp.com/avatars/${this.user?.id}/${this.user?.avatar}.png?size=4096`,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
    };
    const jsonToSend = JSON.stringify(body);
    axios.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err: ", err.response.data));
  };

  sendInteraction = async (type: string, extra: string, server: Server, channelID: string, messageID: string): Promise<void> => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const resp = await axios
      .get<Guild>(`https://discord.com/api/v9/guilds/${server.guildID}`, {
        headers: {
          cookie: await getCookie(),
          authorization: this.token,
          ...commonHeaders,
        },
      })
      .then((resp) => resp)
      .catch((err) => {
        console.log(err.response.body);
      });
    const body = {
      content: null,
      embeds: [
        {
          title: "Interaction Occurred",
          color: parseInt("0EE9F4", 16),
          fields: [
            {
              name: "Type",
              value: type,
            },
            {
              name: "Data",
              value: extra,
            },
            {
              name: "Server",
              value: server.name,
              inline: true,
            },
            {
              name: "Channel",
              value: channelID,
              inline: true,
            },
            {
              name: "Message",
              value: messageID,
              inline: true,
            },
          ],
          author: {
            name: this.user?.username,
            url: "https://xpgrinder.xyz/",
            icon_url: `https://cdn.discordapp.com/avatars/${this.user?.id}/${this.user?.avatar}.png?size=4096`,
          },
          footer: {
            text: time,
          },
          thumbnail: {
            url: `https://cdn.discordapp.com/icons/${server.guildID}/${resp?.data.icon}.png?size=4096`,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
    };
    const jsonToSend = JSON.stringify(body);
    axios.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err: ", err.response.data));
  };
}
