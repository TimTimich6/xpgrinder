import axios from "axios";
import headers from "./headers";

interface captchaData {
  captcha_key: string[];
  captcha_sitekey: string;
  captcha_service?: string;
  captcha_rqdata: string;
  captcha_rq: string;
}

interface createTaskData {
  clientKey: string;
  task: Task;
}
interface Task {
  type: string;
  websiteUrl: string;
  websiteKey: captchaData["captcha_sitekey"];
  isInvisible?: boolean;
  data: captchaData["captcha_rqdata"];
  proxyType: string;
  proxyAddress: string;
  proxyPort: number;
  proxyLogin: string;
  proxyPassword: string;
  userAgent: string;
  cookies: string;
}
export interface Guild {
  id: string;
  name: string;
  splash: string;
  banner: string;
  description?: any;
  icon: string;
  features: string[];
  verification_level: number;
  vanity_url_code: string;
  premium_subscription_count: number;
  nsfw: boolean;
  nsfw_level: number;
}

export interface Channel {
  id: string;
  name: string;
  type: number;
}

export interface Inviter {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
}

export interface InviteSuccess {
  code: string;
  type: number;
  expires_at: Date;
  guild: Guild;
  channel: Channel;
  inviter: Inviter;
}
export const invite = async (link: string, token: string, amount: number = 1): Promise<void> => {
  if (!link.includes("https://discord")) throw new Error();
  const code: string = link.substring(link.lastIndexOf("/") + 1);
  console.log(code);
  const resp: InviteSuccess | captchaData = await axios
    .post(`https://discord.com/api/v9/invites/${code}`, {}, { headers: { ...headers, authorization: token } })
    .then((resp) => resp.data)
    .catch((err) => err.response.data);
  if (isSuccess(resp)) console.log("success in joining");
  else if (resp.captcha_key) solveCaptcha(resp);
};
invite("https://discord.gg/ThJ9JnUS", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8");

const solveCaptcha = async (data: captchaData): Promise<void> => {
  axios.post("https://api.capmonster.cloud/createTask", data);
};

function isSuccess(input: InviteSuccess | captchaData): input is InviteSuccess {
  return "guild" in input;
}
//geo.iproyal.com:12323
// const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
//
