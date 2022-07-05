import axios from "axios";
import commonHeaders, { getCookie } from "./headers";

import { HttpsProxyAgent } from "https-proxy-agent";
const proxy = "http://zabra:oYpVV4prBZUtwAS3@proxy.packetstream.io:31112";
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
  const res = await axios
    .get<userData>("https://discord.com/api/v9/users/@me", {
      headers: {
        authorization: <string>token,
        cookie:
          "__dcfduid=adcb2a33ddff3fd98266f5ebfb6eb50b; __sdcfduid=53f16c47f3fe11ebb97342010a0a091103b51d184b552f1814adc67ef661e523cd19aa4536c6a4a3a181204bba26b67d; __stripe_mid=eda543e2-204a-4640-af99-4be0831b695ce7d49c",
        ...commonHeaders,
      },
      httpsAgent: agent,
      proxy: false,
    })
    .then((resp) => {
      console.log("token used:", token);
      console.log("\tusername returned:", resp.data.username);
      console.log("\tid returned:", resp.data.id);
      return resp.data;
    });
  return res;
};
// const token: string | undefined = process.env.MY_TOKEN;

// selfData(<string>token).then((userData: userData) => {
// 	console.log(userData);
// });
