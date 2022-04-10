import { getPaste } from "./../serverside/middleware";
import commonHeaders, { getCookie } from "./headers";
import fetch, { Response } from "node-fetch";
import axios from "axios";
import waitTime from "../utils/waitTime";
interface messageRef {
  channel_id?: string;
  guild_id: string;
  message_id: string;
}
export const postMessage = async (message: string, channelID: string, token: string, ref?: messageRef): Promise<any> => {
  const response: Response = await fetch(`https://discord.com/api/v9/channels/${channelID}/messages`, {
    headers: {
      cookie: await getCookie(),
      authorization: token,
      "content-type": "application/json",
    },
    body: JSON.stringify({ content: message, message_reference: ref ? ref : null }),
    method: "POST",
  });
  const body = await response.json();
  return body;
};

// postReply("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg");
export const startTyping = async (channelID: string, token: string): Promise<void> => {
  await axios.post(`https://discord.com/api/v9/channels/${channelID}/typing`, undefined, {
    headers: { cookie: await getCookie(), authorization: token, ...commonHeaders },
  });
};

export const realType = async (message: string, channelID: string, token: string, time: number, reply: boolean, ref: messageRef): Promise<any> => {
  await waitTime(3);
  await startTyping(channelID, token);
  await waitTime(time);
  let response: Response;
  if (reply) response = await postMessage(message, channelID, token, ref);
  else response = await postMessage(message, channelID, token);
  return response;
};
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
    if (response && !response.code) {
      await waitTime(1);
      console.log("random: ", message, "for token", token.slice(0, 5));
      deleteMessage(channelID, response.id, token);
    }
    if (response && response.code) console.log(response.message);
  }, delay * 1000);
  return spamInterval;
};
// realType("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg", 1).then((resp) => {
//   console.log(resp);
// });

// spamMessages("936904237064007704", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8", 5);

export const testSend = async (message: string, token: string, channelID: string): Promise<boolean> => {
  const response = await postMessage(message, channelID, token).catch((err) => false);
  if (!response) return false;
  if (response.id) {
    await waitTime(1);
    await deleteMessage(channelID, response.id, token).catch((err) => console.log("error when deleting a test message"));
    console.log("channel test successful");
    return true;
  }
  return false;
};

//https://apps.timwhitlock.info/emoji/tables/unicode
export const reactMessage = async (channelID: string, messageID: string, rxn: string, token: string): Promise<void> => {
  const encoded = encodeURIComponent(rxn);
  const resp = await axios
    .put(
      `https://discord.com/api/v9/channels/${channelID}/messages/${messageID}/reactions/${encoded}/%40me`,
      {},
      {
        headers: {
          cookie: await getCookie(),
          authorization: token,
          ...commonHeaders,
        },
      }
    )
    .catch((err) => {
      if (err.response && err.response.data) console.log("err reacting", err.response.data.code, err.response.data.message);
    });
};

// reactMessage("936904237064007704", "962440096618020864", "😆", "NTE2MzY5MTQzMDQ2MzQwNjA4.Yi5Jgw.Ixs8bay3l-HAYj5-z7ioSRdy46M");
