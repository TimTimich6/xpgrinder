import axios, { AxiosResponse } from "axios";
import commonHeaders from "./headers";
type Message = {
  id: string;
  content: string;
  channel_id: string;
  author: Author;
  timestamp: string;
};
type Author = {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
};

export const getMessages = async (channelID: string, limit: number = 5, token: string): Promise<Message[]> => {
  const resp: AxiosResponse = await axios.get(`https://discord.com/api/v9/channels/${channelID}/messages?limit=${limit}`, {
    headers: {
      authorization: token,
      ...commonHeaders,
    },
  });
  const messages: Message[] = resp.data;
  return messages;
};
getMessages("779580415199019042", undefined, "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg").then((response) => {
  console.log(response);
});
