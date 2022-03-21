import { WebSocket } from "ws";
import { realType } from "./sendmessage";
import { receiveMessage } from "../cleverBotAPI";
import { getTime } from "../utils/logger";
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
}
//indentifying payload sent

export const trackserver = async (guildID: string, token: string, filters: Filter[], settings: Settings, user?: string): Promise<WebSocket> => {
  console.log(filters);
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
    console.log("handshake opened");
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
        // console.log(d);
        if (d.guild_id === guildID && d.author.id !== user) {
          //&& d.author.id !== "516369143046340608"
          const content: string = d.content;
          console.log(getTime(), author, ": ", content);
          if (settings.useAI == false && filters.some((e: Filter) => e.filter.toUpperCase() == content.toUpperCase())) {
            const filter: Filter = <Filter>filters.find((e: Filter) => e.filter.toUpperCase() == content.toUpperCase());
            console.log(getTime(), "responding with:", filter.response);
            await realType(filter.response, d.channel_id, token, 6, settings.reply, {
              channel_id: d.channel_id,
              guild_id: guildID,
              message_id: d.id,
            });
          } else if (settings.useAI == true) {
            const output: string = await receiveMessage(d.content);
            console.log(getTime(), "responding with:", output);
            await realType(output, d.channel_id, token, 6, settings.reply, {
              channel_id: d.channel_id,
              guild_id: guildID,
              message_id: d.id,
            });
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
