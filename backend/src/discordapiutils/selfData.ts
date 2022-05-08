import axios from "axios";
import commonHeaders, { getCookie } from "./headers";

import { HttpsProxyAgent } from "https-proxy-agent";
const proxy = "http://zabra:qsmsoijITfkEU2VG@proxy.packetstream.io:31112";
export const agent = new HttpsProxyAgent(proxy);
export interface userData {
  username: string;
  id: string;
  avatar: string;
  email: string;
  discriminator: string;
  phone: string;
  verified: boolean;
}

export const selfData = async (token: string): Promise<userData> => {
  const res = await axios
    .get<userData>("https://discord.com/api/v9/users/@me", {
      headers: {
        authorization: <string>token,
        cookie: await getCookie(),
        ...commonHeaders,
      },
    })
    .then((resp) => {
      console.log("token used:", token);
      console.log("\tusername returned:", resp.data.username);
      console.log("\tid returned:", resp.data.id);
      return resp.data;
    });
  return res;
};

export const getTokenProxy = async (token: string): Promise<userData | null> => {
  const resp = await axios
    .get<userData>("https://discord.com/api/v9/users/@me", {
      headers: {
        authorization: <string>token,
        cookie: await getCookie(),
        ...commonHeaders,
      },
      httpsAgent: agent,
    })
    .catch((err) => {
      console.log("error in getting user data with proxy");
      return null;
    });
  if (resp) return resp.data;
  return null;
};
// const token: string | undefined = process.env.MY_TOKEN;

// selfData(<string>token).then((userData: userData) => {
// 	console.log(userData);
// });
