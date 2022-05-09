import axios from "axios";
export const getCookie = async (): Promise<string> => {
  const response: any = await axios.get("http://discord.com").catch((err) => null);
  if (response) {
    const cookieArray: string[] = response.headers["set-cookie"];
    const cookie: string = cookieArray.join(";");
    return cookie;
  }
  return "__dcfduid=a13189287b03c3a1d99d6fa484e19bd3; __sdcfduid=a3121050038011eca7fdd1733fb7258b949b379806de132863d1099ff2b6572ffe23a45002ed758abdd329f7ff174bdb; locale=en-US; OptanonConsent=isIABGlobal=false&datestamp=Sat+Apr+23+2022+20:46:50+GMT-0700+(Pacific+Daylight+Time)&version=6.33.0&hosts=&landingPath=NotLandingPage&groups=C0001:1,C0002:1,C0003:1&AwaitingReconsent=false";
};

export const userAgent: string =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.263 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36";

export const referer: string = "https://discord.com/channels/@me";

export const secProps = {
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-fetch-dest": "empty",
};
export const xsuperProperties =
  "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMC4wLjQ4OTYuODggU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6IjEwMC4wLjQ4OTYuODgiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHA6Ly8xMjcuMC4wLjE6NTUwMC8iLCJyZWZlcnJpbmdfZG9tYWluIjoiMTI3LjAuMC4xOjU1MDAiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTI0ODIzLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==";

export const xcontextproperties =
  "eyJsb2NhdGlvbiI6IkpvaW4gR3VpbGQiLCJsb2NhdGlvbl9ndWlsZF9pZCI6IjkxNjUzNjExNjY4ODA4MDk4NyIsImxvY2F0aW9uX2NoYW5uZWxfaWQiOiI5MTc2OTAxMDcwOTAzMTMyMTYiLCJsb2NhdGlvbl9jaGFubmVsX3R5cGUiOjB9";
export default {
  referer: referer,
  "content-type": "application/json",
  Accept: "*/*",
  host: "discord.com",
  "User-Agent": userAgent,
  origin: "https://discord.com",
  "x-super-properties": xsuperProperties,
  "x-context-properties": xcontextproperties,
  ...secProps,
};

export const interaction = {
  referrer: "https://discord.com/api/v9/users/@me",
  referrerPolicy: "strict-origin-when-cross-origin",
  accept: "*/*",
  "accept-language": "en-US",
  authorization: "OTU5NzcyNzUwMDczOTcwNzE4.YkgwDA.lj7QeLtbkptTjaaNbfuVjCUqbOs",
  "content-type": "application/json",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-debug-options": "bugReporterEnabled",
  "x-discord-locale": "en-US",
  "x-super-properties":
    "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MDA0Iiwib3NfdmVyc2lvbiI6IjEwLjAuMTkwNDMiLCJvc19hcmNoIjoieDY0Iiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTI3MTM1LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
  cookie:
    "__dcfduid=adcb2a33ddff3fd98266f5ebfb6eb50b; __sdcfduid=53f16c47f3fe11ebb97342010a0a091103b51d184b552f1814adc67ef661e523cd19aa4536c6a4a3a181204bba26b67d; __stripe_mid=eda543e2-204a-4640-af99-4be0831b695ce7d49c",
};
