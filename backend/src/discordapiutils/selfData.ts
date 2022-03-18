import axios from "axios";
import dotenv from "dotenv";
import commonHeaders, { getCookie } from "./headers";
dotenv.config();
interface userData {
  username: string;
  id: string;
  avatar: string;
  email: string;
  discriminator: string;
  phone: string;
}
export const selfData = async (token: string): Promise<userData> => {
  const res: any = await axios
    .get("https://discord.com/api/v9/users/@me", {
      headers: {
        authorization: <string>token,
        cookie: await getCookie(),
        ...commonHeaders,
      },
    })
    .then((resp) => resp.data)
    .catch((err) => {
      return {
        error: "Couldnt get data on token",
      };
    });
  return res;
};
// const token: string | undefined = process.env.MY_TOKEN;

// selfData(<string>token).then((userData: userData) => {
// 	console.log(userData);
// });
