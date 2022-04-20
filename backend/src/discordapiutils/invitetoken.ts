import axios, { AxiosError } from "axios";
import waitTime from "../utils/waitTime";
import commonheaders, { userAgent } from "./headers";

interface captchaData {
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

interface CreateTaskType {
  clientKey: string;
  task: Task;
  softId?: number;
  languagePool?: string;
}
interface SuccessfulTask {
  errorId: number;
  taskId: number;
}

interface TaskWithError {
  errorId: number;
  errorCode: string;
  errorDescription: string;
}

interface TaskSolved {
  errorId: number;
  status: string;
  solution: Solution;
  cost: string;
  ip: string;
  createTime: number;
  endTime: number;
  solveCount: string;
}

interface Solution {
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

const invite = async (link: string, token: string, maxCaptchas: number, payload?: InvitePayload): Promise<number> => {
  if (!link.includes("https://discord")) throw new Error("Not a valid url");
  const code: string = link.substring(link.lastIndexOf("/") + 1);
  const { data, headers, status } = await axios
    .post<InviteSuccess>(`https://discord.com/api/v9/invites/${code}`, payload || {}, { headers: { ...commonheaders, authorization: token } })
    .catch((err: AxiosError<captchaData | GeneralDiscordError>) => {
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

  if ("guild" in data) {
    console.log("success in joining");
    if (data.show_verification_form == true) {
      const bypassed = await bypassTos(data.guild.id, code, token);
      if (bypassed) return 1;
      return 2;
    }
    return 1;
  } else if ("captcha_key" in data) {
    console.log("captcha", maxCaptchas);
    if (maxCaptchas == 0) {
      console.log("Captcha max reached");
      return 0;
    }
    console.log("Captcha Key:", data.captcha_key);
    const solution = await solveCaptcha(data);
    if (typeof solution != "number") {
      const resp = await invite(link, token, maxCaptchas - 1, { captcha_key: solution.gRecaptchaResponse, captcha_rqtoken: data.captcha_rqtoken });
      return resp;
    } else console.log("Unable to solve captcha", solution);
    return 0;
  } else if ("code" in data) return -1;
  else {
    console.log("end reached, returning 0");
    return 0;
  }
};
// invite("https://discord.gg/rczPSNdT", "OTU2NjQzNTI5MzQwMzc1MDUx.YjzOHQ.VQabvD4wnPiArNKveNEwmUrP5wQ", 4);
// bypassTos("948389739671744572", "bearwithus", "OTQxMzAxMzI3MDU1NzEyMzE2.YgT9Nw.DekzbPK8r8WsOSodngpCzE8aEQY");

async function solveCaptcha(captcha: captchaData): Promise<Solution | number> {
  const payload: CreateTaskType = {
    clientKey: "37406cd62f806094a7e93f83f3832fdf",
    languagePool: "en",
    task: {
      type: "HCaptchaTaskProxyless",
      websiteURL: "https://discord.com/channels/@me",
      websiteKey: captcha.captcha_sitekey,
      isInvisible: false,
      userAgent: userAgent,
      enterprisePayload: {
        rqdata: captcha.captcha_rqdata,
        sentry: true,
      },
    },
  };

  const { data } = await axios
    .post<SuccessfulTask>("https://api.anti-captcha.com/createTask", payload, {
      headers: { "content-type": "application/json" },
    })
    .catch((err: AxiosError<TaskWithError>) => {
      if (axios.isAxiosError(err) && err.response) {
        console.log("task error:", err.response.data);

        return { data: err.response.data };
      } else {
        console.log("unexpected error: ", err.response?.data);
        throw new Error("An unexpected error occurred");
      }
    });

  if ("taskId" in data) {
    for (let index = 0; index < 3; index++) {
      await waitTime(20);
      const taskGetData = await axios
        .post<TaskWithError | TaskSolved>(
          "https://api.anti-captcha.com/getTaskResult",
          { clientKey: "37406cd62f806094a7e93f83f3832fdf", taskId: data.taskId },
          { headers: { "content-type": "application/json" } }
        )
        .then((resp) => resp.data);
      if ("solution" in taskGetData) {
        console.log("solution received");
        return taskGetData.solution;
      }
    }
    return -2;
  }
  return -2;
}

async function bypassTos(guildID: string, code: string, token: string): Promise<boolean> {
  const { data } = await axios
    .get<ScreeningForm>(`https://discord.com/api/v9/guilds/${guildID}/member-verification?with_guild=false&invite_code=${code}`, {
      headers: { ...commonheaders, authorization: token },
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

const tokens = ["OTI2NDQ1MTc0NTM0NTgyMzIy.Yc7xZw.TzMZ1mheOUcCQ1h6ovZWxQzJeAM", "OTQxNzY4NzcxNTgyOTcxOTk0.YiU6Ag.avJ4hYOamPXOp9UOg2nah7kG0xQ"];
const inviteMass = async () => {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    console.log("final", await invite("https://discord.gg/wRghdwrY", token, 4));
  }
};

inviteMass();
