//written by timlol#0001

import { Guild } from "./invitetoken";
import { WebSocket } from "ws";
import { reactMessage, realType } from "./sendmessage";
import { getTime } from "../utils/logger";
import { generateAIResponse } from "../utils/other";
import waitTime from "../utils/waitTime";
import webhook from "./webhook";
import { userData } from "./selfData";
import { emojiRegex } from "../serverside/middleware";
const token: string = <string>process.env.MY_TOKEN;

interface Payload {
  op: number;
  d?: Data | number;
  s?: number;
  t?: string;
}

interface Data {
  token: string;
  intents?: number;
  properties: {
    $os: string;
    $browser: string;
    $device: string;
  };
}

interface Filter {
  filter: string;
  response: string;
}

export interface Settings {
  dialogueMode: boolean;
  reply: boolean;
  useAI: boolean;
  responseTime: number;
  exactMatch: boolean;
  percentResponse: number;
  spamChannel: string;
  channels: string;
  giveaway: string;
  emoji: string;
}
export interface Server {
  name: string;
  filters: { filter: string; response: string }[];
  img: string;
  settings: Settings;
  guildID: string;
  tracking: boolean;
  uuid: string;
}

export class SocketTracker {
  readonly token: string;
  readonly servers: Server[];
  user: userData | undefined;
  socket: WebSocket;
  session_id: string | undefined;
  lastSeq: number | undefined;
  lastAck = Date.now();
  wh: webhook | undefined;
  url: string;
  hbInterval: NodeJS.Timer | undefined;
  constructor(token: string, servers: Server[], url: string) {
    this.token = token;
    this.servers = servers;
    this.socket = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
    this.url = url;
    const payload: Payload = {
      op: 2,
      d: {
        token: token,
        // intents: 513,
        properties: {
          $os: "linux",
          $browser: "chrome",
          $device: "chrome",
        },
      },
    };
    this.socket.on("open", (): void => {
      this.socket.send(JSON.stringify(payload));
      console.log("handshake opened for", token);
      console.log(
        "Servers: ",
        servers.map((server) => {
          return { name: server.name, tracking: server.tracking, settings: server.settings };
        })
      );
    });

    this.socket.on("message", async (data: string): Promise<void> => {
      let payload: any = JSON.parse(data);
      const { t, s, op, d } = payload;
      if (s) this.lastSeq = s;
      switch (op) {
        case 10:
          const { heartbeat_interval }: { heartbeat_interval: number } = d;
          webhook.sentHeartbeat(url, heartbeat_interval, "green");
          this.hbInterval = this.heartbeat(heartbeat_interval);
          break;
        case 11:
          this.lastAck = Date.now();
          break;
        case 7:
          this.wh?.sendEvent(op, "Reconnect Call received", "orange");
          await waitTime(1);
          this.socket = this.reconnect();
          break;
        case 6:
          console.log("op 6 received ");
          break;
        case 1:
          this.socket.send(JSON.stringify({ op: 1, d: null }));
          this.wh?.sendEvent(op, "Emergency heartbeat sent", "yellow");

          break;
        default:
          break;
      }
      if (d) {
        const server = this.servers.find((server) => d.guild_id === server.guildID);
        switch (t) {
          case "READY":
            console.log("ready occured");
            let payload: any = JSON.parse(data);
            // console.log(payload.d.user);
            this.user = payload.d.user;
            this.session_id = payload.d.session_id;
            console.log("session", this.session_id);

            if (this.user) {
              console.log(this.url);
              this.wh = new webhook(this.token, this.url, this.user);
              this.wh.sendUser();
            }
            break;
          case "RECONNECT":
            console.log("reconnect event occured");
            this.wh?.sendEvent(
              "Reconnect request received",
              "Possibility of failure to reconnect to websocket may occur. Please contant timlol if it happens",
              "orange"
            );

            break;
          case "RESUME":
            console.log("resume response");
            break;
          case "MESSAGE_CREATE":
            const author: string = d.author.username;
            const channelOK =
              server && server.settings.channels.length >= 18 ? (server.settings.channels.includes(d.channel_id) ? true : false) : true;
            if (server && d.author.id !== this.user?.id && channelOK) {
              const filters = server.filters;
              const settings = server.settings;
              const content: string = d.content;
              const filter: Filter | undefined = settings.exactMatch
                ? filters.find((e: Filter) => e.filter.toUpperCase() == content.toUpperCase())
                : filters.find((e: Filter) => content.toUpperCase().includes(e.filter.toUpperCase()));
              if (filter) {
                console.log(`${getTime()} ${author} : ${content} --> ${filter.response}`);
                const rand = Math.floor(Math.random() * 100);
                if (rand < settings.percentResponse) {
                  console.log("responding");
                  await realType(filter.response, d.channel_id, token, settings.responseTime, settings.reply, {
                    channel_id: d.channel_id,
                    guild_id: server.guildID,
                    message_id: d.id,
                  }).catch((err) => {
                    console.log("Error caught when trying to respond");
                    this.wh?.sendInteraction(t, "ERROR WHEN ATTEMPTING TO SEND MESSAGE", server, d.channel_id, d.message_id);
                  });
                  this.wh?.sendInteraction(t, `Responded to message "${content}" with filter "${filter.response}"`, server, d.channel_id, d.id);
                }
              } else if (server.settings.useAI && checkAI(content, settings.percentResponse)) {
                console.log("generating AI");
                const response = await generateAIResponse(content);
                if (response) {
                  console.log("AI response:", response);
                  this.wh?.sendInteraction(t, `Responding to message "${content}" with AI response "${response}"`, server, d.channel_id, d.id);
                  await realType(response, d.channel_id, token, settings.responseTime, settings.reply, {
                    channel_id: d.channel_id,
                    guild_id: server.guildID,
                    message_id: d.id,
                  }).catch(() => {
                    console.log("Error caught when trying to respond");
                    this.wh?.sendInteraction(t, "ERROR WHEN ATTEMPTING TO SEND MESSAGE", server, d.channel_id, d.message_id);
                  });
                }
              }
            }

            break;
          case "MESSAGE_REACTION_ADD":
            // const checkReact = d.message_id + encodeURIComponent(d.emoji.name);
            if (server && server.settings.giveaway == d.channel_id && d.user_id != this.user?.id) {
              await waitTime(3);
              await reactMessage(d.channel_id, d.message_id, d.emoji.name, token)
                .then((resp) => {
                  console.log("reacted to giveaway channel", server.settings.giveaway, "with", d.emoji.name);
                  const detail = `Reaction with ${d.emoji.name}`;
                  this.wh?.sendInteraction(t, detail, server, d.channel_id, d.message_id);
                  return resp;
                })
                .catch((_) => this.wh?.sendInteraction(t, "ERROR WHEN ATTEMPTING TO REACT TO MESSAGE", server, d.channel_id, d.message_id));
            }
            break;
          default:
            break;
        }
      }
    });

    this.socket.on("error", async (err) => {
      console.log("Web socket error occured");
      this.socket = this.reconnect();
    });
  }

  stop() {
    this.socket.close();
    if (this.hbInterval) clearInterval(this.hbInterval);
    this.wh?.sendEvent("Stopped tracker", "User requested to stop tracking", "black");
    return;
  }
  heartbeat = (ms: number): NodeJS.Timer => {
    const beatInterval = setInterval(async () => {
      this.socket.send(JSON.stringify({ op: 1, d: this.lastSeq ?? null }));
      await waitTime(3);
      if (Date.now() > this.lastAck + 3000) {
        this.wh?.sendEvent(11, "Error: Zombied ACK, please restart tracking and notify timlol#0001 about the error", "red");
        clearInterval(beatInterval);
      }
    }, ms);
    return beatInterval;
  };
  reconnect = (): WebSocket => {
    this.socket.close();
    let newWs = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
    newWs.on("open", () => {
      this.wh?.sendEvent(6, "Reopened Websocket", "green");
      this.socket.send(
        JSON.stringify({
          op: 6,
          d: {
            token: this.token,
            session_id: this.session_id,
            seq: this.lastSeq,
          },
        }),
        (err) => console.log("reopened websocket", err)
      );
    });
    return newWs;
  };
}

const checkAI = (content: string, random: number): boolean => {
  const rand = Math.floor(Math.random() * 100) < random;
  if (rand && content.length > 2 && content.length < 40 && !emojiRegex.test(content) && !/\d{18}/g.test(content)) return true;
  return false;
};
