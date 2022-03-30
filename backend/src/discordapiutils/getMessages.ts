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

export const getMessages = async (channelID: string, limit: number = 1, token: string): Promise<Message[]> => {
  const resp: AxiosResponse = await axios.get(`https://discord.com/api/v9/channels/${channelID}/messages?limit=${limit}`, {
    headers: {
      authorization: token,
      ...commonHeaders,
    },
  });
  const messages: Message[] = resp.data;
  return messages;
};
getMessages("95790573247125500", 1, "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8")
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.log("ERROR: ", err.response.data.message, "CODE: ", err.response.data.code);
  });
