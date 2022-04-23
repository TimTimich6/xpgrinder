import axios from "axios";
import dotenv from "dotenv";
import commonHeaders, { getCookie } from "./headers";
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
// const token: string | undefined = process.env.MY_TOKEN;

// selfData(<string>token).then((userData: userData) => {
// 	console.log(userData);
// });
