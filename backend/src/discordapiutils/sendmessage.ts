import commonHeaders, { getCookie } from "./headers";
import fetch, { Response } from "node-fetch";
import axios from "axios";
import waitTime from "../utils/waitTime";

interface messageRef {
  channel_id?: string;
  guild_id: string;
  message_id: string;
}
export const postMessage = async (message: string, channelID: string, token: string, ref?: messageRef): Promise<Response> => {
  const response: Response = await fetch(`https://discord.com/api/v9/channels/${channelID}/messages`, {
    headers: {
      cookie: await getCookie(),
      authorization: token,
      "content-type": "application/json",
    },
    body: JSON.stringify({ content: message, message_reference: ref ? ref : null }),
    method: "POST",
  });

  return response;
};

// postReply("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg");
export const startTyping = async (channelID: string, token: string): Promise<void> => {
  await axios.post(`https://discord.com/api/v9/channels/${channelID}/typing`, undefined, {
    headers: { cookie: await getCookie(), authorization: token, ...commonHeaders },
  });
};

export const realType = async (message: string, channelID: string, token: string, time: number, reply: boolean, ref: messageRef): Promise<any> => {
  await waitTime(5);
  await startTyping(channelID, token);
  await waitTime(time);
  let response: Response;
  if (reply) response = await postMessage(message, channelID, token, ref);
  else response = await postMessage(message, channelID, token);
  const readStream: any = await response.json();
  return readStream;
};
// realType("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg", 1).then((resp) => {
//   console.log(resp);
// });
