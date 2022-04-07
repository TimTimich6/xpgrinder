import { WebSocket } from "ws";
import { realType } from "./sendmessage";
import { getTime } from "../utils/logger";
import { error } from "console";
import { generateAIResponse } from "../utils/other";
const token: string = <string>process.env.MY_TOKEN;

interface Payload {
  op: number;
  d: Data | number;
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
[];
//indentifying payload sent

export const trackserver = async (servers: Server[], token: string, userid: string): Promise<WebSocket> => {
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
  const ws: WebSocket = new WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
  // console.log(ws);
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
    // console.log(payload);
    switch (op) {
      case 10:
        const { heartbeat_interval }: { heartbeat_interval: number } = d;
        heartbeat(heartbeat_interval);
        console.log("beat");
        break;

      default:
        break;
    }
    switch (t) {
      case "MESSAGE_CREATE":
        const author: string = d.author.username;
        const server = servers.find((server) => d.guild_id === server.guildID);
        const channelOK = server && server.settings.channels.length >= 18 ? (server.settings.channels.includes(d.channel_id) ? true : false) : true;
        if (server && server.settings.spamChannel.length != 18 && d.author.id !== userid && channelOK) {
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
          } else if (server.settings.useAI) {
            const rand = Math.floor(Math.random() * 100);
            if (rand < settings.percentResponse) {
              const response = await generateAIResponse(content);
              if (response) {
                console.log("respondin with AI", response);
                await realType(response, d.channel_id, token, settings.responseTime, settings.reply, {
                  channel_id: d.channel_id,
                  guild_id: server.guildID,
                  message_id: d.id,
                }).catch((err) => {
                  console.log("Error caught when trying to respond");
                });
              }
            }
          }
        }
        break;
      default:
        break;
    }
  });
  const heartbeat = (ms: number): NodeJS.Timer => {
    return setInterval(() => {
      ws.send(JSON.stringify({ op: 1, d: null }));
    }, ms);
  };
  return ws;
};

// trackserver();
