import { WebSocket } from "ws";
import { reactMessage, realType } from "./sendmessage";
import { getTime } from "../utils/logger";
import { generateAIResponse } from "../utils/other";
import waitTime from "../utils/waitTime";
import axios from "axios";
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

//indentifying payload sent
const socketurl = "https://discord.com/api/webhooks/962882014640504892/IO59x6FeCMwsV9zPsLr9rkVm4XOTCGGp-qurD6f0dfrZREAgfEfXNlCiOdQda9o5zPZ8";
export const trackserver = async (servers: Server[], token: string, userid: string): Promise<WebSocket> => {
  let session_id: string;
  let lastSeq: number | undefined;
  let lastAck = Date.now();
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
  let ws: WebSocket = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");

  ws.on("open", (): void => {
    ws.send(JSON.stringify(payload));
    console.log("handshake opened for", token);
    console.log(
      "Servers: ",
      servers.map((server) => {
        return { name: server.name, tracking: server.tracking, settings: server.settings };
      })
    );
    console.log("userid: ", userid);
  });

  ws.on("message", async (data: string): Promise<void> => {
    let payload: any = JSON.parse(data);
    const { t, s, op, d } = payload;
    if (s) lastSeq = s;
    switch (op) {
      case 10:
        const { heartbeat_interval }: { heartbeat_interval: number } = d;
        sendEmbed(op, "inital heartbeat sent", "5efc03");
        heartbeat(heartbeat_interval);
        break;
      case 11:
        lastAck = Date.now();
        // console.log("ack received, op:", op);
        // sendEmbed(op, "ack received", "#038cfc");
        break;
      case 7:
        sendEmbed(op, "reconnect received", "fc0f03");
        await waitTime(1);
        ws = await reconnect();
        break;
      case 6:
        console.log("op 6 received ");
        break;
      case 1:
        console.log("op 1 received, sending heartbeat ");
        sendEmbed(op, "emergency heartbeat sent", "fc8803");
        ws.send(JSON.stringify({ op: 1, d: null }));
        break;
      default:
        break;
    }
    if (d) {
      const server = servers.find((server) => d.guild_id === server.guildID);
      switch (t) {
        case "READY":
          console.log("ready occured");
          let payload: any = JSON.parse(data);
          session_id = payload.d.session_id;
          console.log("session", session_id);
          break;
        case "RECONNECT":
          console.log("reconnect event occured");
          break;
        case "RESUME":
          console.log("resume response");
          break;
        case "MESSAGE_CREATE":
          const author: string = d.author.username;
          const channelOK = server && server.settings.channels.length >= 18 ? (server.settings.channels.includes(d.channel_id) ? true : false) : true;
          if (server && d.author.id !== userid && channelOK) {
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
                });
              }
            }
            // else if (server.settings.useAI) {
            //   const rand = Math.floor(Math.random() * 100);
            //   if (rand < settings.percentResponse) {
            //     const response = await generateAIResponse(content);
            //     if (response) {
            //       console.log("respondin with AI", response);
            //       await realType(response, d.channel_id, token, settings.responseTime, settings.reply, {
            //         channel_id: d.channel_id,
            //         guild_id: server.guildID,
            //         message_id: d.id,
            //       }).catch((err) => {
            //         console.log("Error caught when trying to respond");
            //       });
            //     }
            //   }
            // }
          }

          break;
        case "MESSAGE_REACTION_ADD":
          // const checkReact = d.message_id + encodeURIComponent(d.emoji.name);
          if (server && server.settings.giveaway == d.channel_id && d.user_id != userid) {
            await waitTime(3);
            await reactMessage(d.channel_id, d.message_id, d.emoji.name, token).then((resp) => {
              console.log("reacted to giveaway channel", server.settings.giveaway, "with", d.emoji.name);
              return resp;
            });
          }
          break;
        default:
          break;
      }
    }
  });

  ws.on("error", async (err) => {
    console.log("Web socket error occured");
    ws = await reconnect();
  });

  const heartbeat = (ms: number): NodeJS.Timer => {
    return setInterval(async () => {
      ws.send(JSON.stringify({ op: 1, d: lastSeq ?? null }));
      await waitTime(3);
      if (Date.now() > lastAck + 3000) {
        sendEmbed(11, "zombied ack", "fc2403");
        ws = await reconnect();
      }
    }, ms);
  };

  const reconnect = async (): Promise<WebSocket> => {
    ws.close();
    let newWs = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
    console.log("attempting to reconnect and resume");
    newWs.on("open", () => {
      sendEmbed(6, "reopened websocket", "03fcb5");
      ws.send(
        JSON.stringify({
          op: 6,
          d: {
            token: token,
            session_id: session_id,
            seq: lastSeq,
          },
        }),
        (err) => console.log("reopened websocket", err)
      );
    });
    return newWs;
  };
  return ws;
};
//https://discord.com/api/webhooks/962882014640504892/IO59x6FeCMwsV9zPsLr9rkVm4XOTCGGp-qurD6f0dfrZREAgfEfXNlCiOdQda9o5zPZ8

const sendEmbed = (op: number, description: string, color: string) => {
  const time = new Date(Date.now()).toLocaleTimeString();
  const decimalColor = parseInt(color, 16);
  const body = {
    content: null,
    embeds: [
      {
        title: "WebSocket event",
        description: description,
        color: decimalColor,
        fields: [
          {
            name: "Time",
            value: time,
          },
          {
            name: "Op",
            value: op,
          },
        ],
      },
    ],
  };
  const jsonToSend = JSON.stringify(body);
  axios.post(socketurl, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err: ", err.response.data));
};
