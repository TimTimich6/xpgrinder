import { HttpsProxyAgent } from "https-proxy-agent";
import axios, { Axios, AxiosError } from "axios";
import waitTime from "../utils/waitTime";
import commonheaders, { getCookie, userAgent } from "./headers";
import { InviterWebhook } from "./inviterWebhook";
import { agent } from "./selfData";

const clientKey = "898dc14ab0768f8250193ed2d4af4666";
const TwoCapKey = "d3bcb4eeed1069b8dccb8219f9b0ab7e";
export interface captchaData {
  captcha_key: string[];
  captcha_sitekey: string;
  captcha_service?: string;
  captcha_rqdata: string;
  captcha_rqtoken: string;
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

interface Channel {
  id: string;
  name: string;
  type: number;
}

interface Inviter {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
}

interface InviteSuccess {
  code: string;
  type: number;
  expires_at: Date;
  guild: Guild;
  channel: Channel;
  inviter: Inviter;
  show_verification_form?: boolean;
}
interface Task {
  type: string;
  websiteURL: string;
  websiteKey: string;
  userAgent: string;
  isInvisible?: boolean;
  enterprisePayload: {
    rqdata: string;
    sentry: boolean;
  };
}

interface CreateTaskAnti {
  clientKey: string;
  task: Task;
  softId?: number;
  languagePool?: string;
}
interface CreateTask2Cap {
  key: string;
  method: "hcaptcha";
  sitekey: string;
  pageurl: string;
  invisible?: boolean;
  data: string;
  userAgent: string;
  json: 1;
}
interface SuccessfulTaskAnti {
  errorId: 0;
  taskId: number;
}

interface TaskWithErrorAnti {
  errorId: number;
  errorCode: string;
  errorDescription: string;
}

interface TaskSolvedAnti {
  errorId: number;
  status: string;
  solution: SolutionAnti;
  cost: string;
  ip: string;
  createTime: number;
  endTime: number;
  solveCount: string;
}
export interface SuccessfulCreate2Cap {
  status: 1;
  request: string;
}
interface FailedSolution2Cap {
  status: 0;
  request: string;
}

interface TwoCapCreateError {
  status: 0;
  request: string;
  error_text?: string;
}
interface SolutionAnti {
  gRecaptchaResponse: string;
}

interface InvitePayload {
  captcha_key: string;
  captcha_rqtoken: string;
}

interface GeneralDiscordError {
  message: string;
  code: number;
}

export const invite = async (
  link: string,
  token: string,
  maxCaptchas: number,
  webhook: InviterWebhook,
  agent: HttpsProxyAgent | null,
  payload?: InvitePayload
): Promise<number> => {
  if (!link.includes("https://discord")) throw new Error("Not a valid url");
  const code: string = link.substring(link.lastIndexOf("/") + 1);
  const { data } = await axios
    .post<InviteSuccess>(`https://discord.com/api/v9/invites/${code}`, payload || {}, {
      headers: { ...commonheaders, authorization: token, Cookie: await getCookie() },
      httpsAgent: agent,
      timeout: 15000,
    })
    .catch((err: AxiosError<captchaData | GeneralDiscordError>) => {
      if (axios.isAxiosError(err) && err.response?.status == 400) {
        return { data: err.response.data, headers: err.response.headers, status: err.response.status };
      } else if (axios.isAxiosError(err) && err.response?.status == 403) {
        console.log(err.response.data);
        return { data: err.response.data, headers: err.response.headers, status: err.response.status };
      } else {
        console.log("unexpected error in invite: ", err);
        throw new Error("An unexpected error occurred");
      }
    });

  if ("guild" in data) {
    console.log("success in joining");
    if (data.show_verification_form == true) {
      const bypassed = await bypassTos(data.guild.id, code, token);
      if (bypassed) return 1;
      return 2;
    }
    return 1;
  } else if ("captcha_key" in data) {
    console.log("captcha left", maxCaptchas);
    if (maxCaptchas == 0) {
      console.log("Captcha max reached");
      return 0;
    }
    console.log("Captcha Key:", data.captcha_key);
    const solution = await solveCaptchaAnti(data);
    if (typeof solution == "number") {
      if (webhook.params.verbose) await webhook.sendCaptcha(data, "Failed to solve");
      const resp = await invite(link, token, maxCaptchas - 1, webhook, agent);
      return resp;
    } else if (typeof solution == "string") {
      if (webhook.params.verbose) await webhook.sendCaptcha(data, solution.slice(-10));
      console.log("solution", solution.slice(-5));
      const resp = await invite(link, token, maxCaptchas - 1, webhook, agent, { captcha_key: solution, captcha_rqtoken: data.captcha_rqtoken });
      return resp;
    } else {
      console.log("Unable to solve captcha", solution);
      return -2;
    }
  } else if ("code" in data) return -1;
  else {
    console.log("end reached, returning 0");
    return 0;
  }
};
// invite("https://discord.gg/rczPSNdT", "OTU2NjQzNTI5MzQwMzc1MDUx.YjzOHQ.VQabvD4wnPiArNKveNEwmUrP5wQ", 4);
// bypassTos("948389739671744572", "bearwithus", "OTQxMzAxMzI3MDU1NzEyMzE2.YgT9Nw.DekzbPK8r8WsOSodngpCzE8aEQY");

async function solveCaptchaAnti(captcha: captchaData): Promise<string | number | TaskWithErrorAnti> {
  const payload: CreateTaskAnti = {
    clientKey,
    languagePool: "en",
    task: {
      type: "HCaptchaTaskProxyless",
      websiteURL: "https://discord.com",
      websiteKey: captcha.captcha_sitekey,
      isInvisible: false,
      userAgent,
      enterprisePayload: {
        rqdata: captcha.captcha_rqdata,
        sentry: false,
      },
    },
  };

  const { data } = await axios
    .post<SuccessfulTaskAnti>("https://api.anti-captcha.com/createTask", payload, {
      headers: { "content-type": "application/json" },
      timeout: 15000,
    })
    .catch((err: AxiosError<TaskWithErrorAnti>) => {
      if (axios.isAxiosError(err) && err.response) {
        console.log("task error:", err.response.data);
        return { data: err.response.data };
      } else {
        console.log("unexpected error: ", err.response?.data);
        throw new Error("An unexpected error occurred");
      }
    });

  if ("taskId" in data) {
    await waitTime(20);
    for (let index = 0; index < 4; index++) {
      const taskGetData = await axios
        .post<TaskWithErrorAnti | TaskSolvedAnti>(
          "https://api.anti-captcha.com/getTaskResult",
          { clientKey, taskId: data.taskId },
          { headers: { "content-type": "application/json" }, timeout: 15000 }
        )
        .then((resp) => resp.data)
        .catch((err: AxiosError<any>) => {
          console.log("anti captcha error or not ready");
          console.log(err);
          return -2;
        });
      if (typeof taskGetData != "number" && "solution" in taskGetData) {
        return taskGetData.solution.gRecaptchaResponse;
      }
      await waitTime(5);
    }
    return -2;
  }
  console.log("failed data", data);
  return -2;
}

async function solveCaptcha2Captcha(captcha: captchaData): Promise<string | number> {
  const payload: CreateTask2Cap = {
    key: TwoCapKey,
    method: "hcaptcha",
    json: 1,
    sitekey: captcha.captcha_sitekey,
    data: captcha.captcha_rqdata,
    userAgent: userAgent,
    pageurl: "https://discord.com/",
  };
  const url = `http://2captcha.com/in.php?key=${payload.key}&method=hcaptcha&sitekey=${payload.sitekey}&pageurl=${payload.pageurl}}&data=${payload.data}&json=1&useragent=${payload.userAgent}`;

  const resp = await axios
    .post<SuccessfulCreate2Cap>(url, payload, {
      headers: { "content-type": "application/json" },
      timeout: 15000,
    })
    .catch((err: AxiosError<TwoCapCreateError>) => {
      if (axios.isAxiosError(err) && err.response) {
        console.log("task error:", err.response.data);
      } else {
        console.log("unexpected error: ", err.response?.data);
      }
      return -2;
    });
  if (typeof resp != "number" && resp.data.status == 1) {
    for (let index = 0; index < 4; index++) {
      await waitTime(20);
      const taskGetData = await axios
        .get<SuccessfulCreate2Cap | FailedSolution2Cap>(`http://2captcha.com/res.php?key=${TwoCapKey}&action=get2&id=${resp.data.request}&json=1`, {
          timeout: 15000,
        })
        .then((resp) => resp.data)
        .catch((err: AxiosError<string>) => {
          if (axios.isAxiosError(err) && err.response) {
            console.log("get task 2cap error", err.response.data);
            return null;
          } else {
            console.log("unexpected error: ", err.response?.data);
            throw new Error("An unexpected error occurred");
          }
        });
      if (taskGetData?.status == 1) {
        // console.log("successful solution 2cap", taskGetData);
        return taskGetData.request;
      } else if (taskGetData?.request.includes("ERROR")) {
        console.log("captcha error, most likely unsolvable");
        return -2;
      } else console.log(taskGetData);
    }
    return -2;
  }
  console.log("failed data", typeof resp != "number" ? resp.data : resp);
  return -2;
}
async function bypassTos(guildID: string, code: string, token: string): Promise<boolean> {
  const { data } = await axios
    .get<ScreeningForm>(`https://discord.com/api/v9/guilds/${guildID}/member-verification?with_guild=false&invite_code=${code}`, {
      headers: { ...commonheaders, authorization: token },
      timeout: 15000,
    })
    .catch((err: AxiosError<ScreeningError | GeneralDiscordError>) => {
      if (axios.isAxiosError(err) && err.response?.status == 400) {
        return { data: err.response.data, headers: err.response.headers, status: err.response.status };
      } else if (axios.isAxiosError(err) && err.response?.status == 403) {
        console.log(err.response.data);
        return { data: err.response.data, headers: err.response.headers, status: err.response.status };
      } else {
        console.log("unexpected error: ", err.response?.data);
        throw new Error("An unexpected error occurred");
      }
    });
  if ("form_fields" in data) {
    const acceptedForms = data.form_fields.map((form) => {
      return { ...form, response: true };
    });
    const payload: SubmitScreening = { version: data.version, form_fields: acceptedForms };
    const screeningDone = await axios
      .put<ScreeningDone>(`https://discord.com/api/v9/guilds/${guildID}/requests/@me`, payload, {
        headers: { ...commonheaders, authorization: token },
        timeout: 15000,
      })
      .then((res) => res.data);
    if (screeningDone.application_status == "APPROVED") {
      console.log("successfully bypassed");
      return true;
    }
  }
  console.log("failure to bypass");
  return false;
}

interface ScreeningForm {
  version: string;
  form_fields: FormField[];
  description: string;
}

interface FormField {
  field_type: string;
  label: string;
  description: null;
  automations: null;
  required: boolean;
  values: string[];
  response?: boolean;
}

interface SubmitScreening {
  version: string;
  form_fields: Required<FormField[]>;
}

interface ScreeningDone {
  created_at: string;
  id: string;
  rejection_reason: string | null;
  application_status: string;
  last_seen: string;
  guild_id: string;
  user_id: string;
}

interface ScreeningError {
  status: number;
  message: string;
}
