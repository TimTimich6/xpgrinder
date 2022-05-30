import { ButtonData } from "./../utils/testproxy";
import { getPaste } from "./../utils/dataRetreriver";
import commonHeaders, { getCookie, interaction } from "./headers";
import fetch, { Response } from "node-fetch";
import axios from "axios";
import waitTime from "../utils/waitTime";
import { agent } from "./selfData";
interface messageRef {
  channel_id?: string;
  guild_id: string;
  message_id: string;
}
export interface Message {
  id: string;
  type: number;
  content: string;
  channel_id: string;
  author: Author;
  attachments: any[];
  embeds: any[];
  mentions: any[];
  mention_roles: any[];
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  timestamp: string;
  edited_timestamp: null;
  flags: number;
  components: any[];
  referenced_message: null;
}
export type ErrorMessage = {
  code: number;
  global: boolean;
  message: string;
  retry_after?: number;
};

export interface Author {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
}
export const postMessage = async (message: string, channelID: string, token: string, ref?: messageRef): Promise<Message> => {
  const response: Response = await fetch(`https://discord.com/api/v9/channels/${channelID}/messages`, {
    headers: {
      cookie: await getCookie(),
      authorization: token,
      "content-type": "application/json",
    },
    agent: agent,
    body: JSON.stringify({ content: message, message_reference: ref ? ref : null }),
    method: "POST",
  });
  const body: Message | ErrorMessage = await response.json();
  if ("code" in body) throw new Error(body.message);
  return body;
};

export const startTyping = async (channelID: string, token: string): Promise<void> => {
  await axios.post(`https://discord.com/api/v9/channels/${channelID}/typing`, undefined, {
    headers: { cookie: await getCookie(), authorization: token, ...commonHeaders },
  });
};

export const realType = async (
  message: string,
  channelID: string,
  token: string,
  time: number,
  reply: boolean,
  delay = 3,
  ref?: messageRef
): Promise<any> => {
  await waitTime(delay);
  await startTyping(channelID, token);
  await waitTime(time);
  let response: Message;
  if (reply) response = await postMessage(message, channelID, token, ref);
  else response = await postMessage(message, channelID, token);

  return response;
};

// realType("hi", "961438859676221461", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8", 2, false);
export const deleteMessage = async (channelID: string, messageID: string, token: string): Promise<void> => {
  axios
    .delete(`https://discord.com/api/v9/channels/${channelID}/messages/${messageID}`, {
      headers: {
        cookie: await getCookie(),
        authorization: token,
        ...commonHeaders,
      },
    })
    .catch((err) => console.log("error when deleting message"));
};
export const spamMessages = async (channelID: string, token: string, delay: number): Promise<NodeJS.Timer> => {
  const data = await getPaste("FttucAdP").catch((err) => {
    console.log("failure to get sentences paste");
    return "Good Morning!";
  });
  const splitSentences: string[] = data.split("\r\n");

  const spamInterval = setInterval(async () => {
    const randIndex = Math.floor(Math.random() * splitSentences.length);
    const message: string = splitSentences[randIndex];

    const response = await postMessage(message, channelID, token).catch((err) => {
      console.log("error caught when sending random message");
      return null;
    });
    if (response) {
      await waitTime(3);
      console.log("random: ", message, "for token", token.slice(0, 5));
      deleteMessage(channelID, response.id, token);
    }
  }, delay * 1000);
  return spamInterval;
};
// spamMessages("936904237064007704", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8", 5);

export const testSend = async (message: string, token: string, channelID: string): Promise<boolean> => {
  const response = await postMessage(message, channelID, token).catch((err) => null);
  if (!response) return false;
  await waitTime(1);
  await deleteMessage(channelID, response.id, token).catch((err) => console.log("error when deleting a test message"));
  console.log("channel test successful");
  return true;
};

//https://apps.timwhitlock.info/emoji/tables/unicode
export const reactMessage = async (channelID: string, messageID: string, rxn: string, token: string, id: string | null): Promise<void> => {
  const encoded = id ? rxn + "%3A" + id : encodeURIComponent(rxn);
  const resp = await axios
    .put(
      `https://discord.com/api/v9/channels/${channelID}/messages/${messageID}/reactions/${encoded}/%40me?location=Message`,
      {},
      {
        headers: {
          cookie: await getCookie(),
          authorization: token,
          ...commonHeaders,
        },
        httpsAgent: agent,
        proxy: false,
      }
    )
    .catch((err) => {
      if (err.response && err.response.data) console.log("err reacting", err.response.data.code, err.response.data.message);
    });
};
// reactMessage("936904237064007704", "962440096618020864", "😆", "NTE2MzY5MTQzMDQ2MzQwNjA4.Yi5Jgw.Ixs8bay3l-HAYj5-z7ioSRdy46M");

export const clickButton = async (token: string, data: ButtonData) => {
  const resp = await axios.post("https://discord.com/api/v9/interactions", data, {
    headers: interaction,
  });
  if (resp.status == 204) console.log("successful click");
  else console.log("failed to click");
};
