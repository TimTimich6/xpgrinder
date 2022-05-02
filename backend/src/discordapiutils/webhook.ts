import { Guild } from "./invitetoken";
import { Server } from "./websocket";
import axios from "axios";
import { userData } from "./selfData";
import commonHeaders, { getCookie } from "./headers";

export type Color = "red" | "green" | "purple" | "yellow" | "orange" | "black" | "blue";
export default class WebHooks {
  readonly token;
  readonly url;
  user: userData;

  constructor(token: string, url: string, user: userData) {
    this.token = token;
    this.url = url;
    this.user = user;
  }
  sendEvent = (title: number | string, description: string, color: Color) => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const decimalColor = parseInt(ColorToInt[color], 16);
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
            icon_url: `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png?size=256`,
          },
          footer: {
            text: time,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=256",
    };
    const jsonToSend = JSON.stringify(body);
    try {
      axios.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err send user: "));
    } catch (error) {
      console.log("failed to send event");
    }
  };

  sendUser = (sessionID: string) => {
    const body = {
      content: null,
      embeds: [
        {
          title: this.token.substring(0, 6) + "...",
          color: parseInt(ColorToInt.purple, 16),
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
            {
              name: "Session ID",
              value: sessionID,
            },
          ],
          author: {
            name: this.user?.username,
            url: "https://xpgrinder.xyz/",
            icon_url: `https://cdn.discordapp.com/avatars/${this.user?.id}/${this.user?.avatar}.png?size=256`,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=256",
    };
    const jsonToSend = JSON.stringify(body);
    try {
      axios.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err send event: "));
    } catch (error) {
      console.log("failed to send user");
    }
  };

  sendInteraction = async (type: string, extra: string, server: Server, channelID: string, messageID: string): Promise<void> => {
    const time = new Date(Date.now()).toLocaleTimeString();
    try {
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
          console.log("err send interaction");
        });
      const body = {
        content: null,
        embeds: [
          {
            title: "Interaction Occurred",
            color: parseInt(ColorToInt.blue, 16),
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
              icon_url: `https://cdn.discordapp.com/avatars/${this.user?.id}/${this.user?.avatar}.png?size=256`,
            },
            footer: {
              text: time,
            },
            thumbnail: {
              url: `https://cdn.discordapp.com/icons/${server.guildID}/${resp?.data.icon}.png?size=256`,
            },
          },
        ],
        username: "XP-GRINDER",
        avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=256",
      };
      const jsonToSend = JSON.stringify(body);
      axios
        .post(this.url, jsonToSend, { headers: { "content-type": "application/json" } })
        .catch((err) => console.log("error caught when sending interaction"));
    } catch (error) {
      console.log("failed to send interaction");
    }
  };

  static sentHeartbeat = (url: string, ms: number, color: Color) => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const decimalColor = parseInt(ColorToInt[color], 16);
    const body = {
      content: null,
      embeds: [
        {
          title: "Heartbeat Interval Sent",
          description: "Initialized heartbeat with Discord Gateway",
          color: decimalColor,
          fields: [
            {
              name: "Interval",
              value: `${ms} milliseconds`,
            },
          ],
          footer: {
            text: time,
          },
        },
      ],
      username: "XP-GRINDER",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=256",
    };
    const jsonToSend = JSON.stringify(body);
    try {
      axios.post(url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err sent heartbeat: "));
    } catch (error) {
      console.log("failed to send heartbeat");
    }
  };
}

export const ColorToInt = {
  green: "9FE2BF",
  red: "DE3163",
  orange: "FF7F50",
  yellow: "DFFF00",
  blue: "6495ED",
  black: "0",
  purple: "A020F0",
};
