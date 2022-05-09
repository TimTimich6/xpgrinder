import fetch from "node-fetch";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
const proxy = "http://zabra:qsmsoijITfkEU2VG@proxy.packetstream.io:31112";
const agent = new HttpsProxyAgent(proxy);
async function testProxy() {
  const res = await fetch("https://api.ipify.org?format=json", {
    method: "GET",
    agent: agent,
  }).then((resRaw) => resRaw.json());
  console.log(res);
}

async function testProxy2() {
  console.log("here");
  const beg = Date.now();
  const res = await axios.get("https://api.ipify.org?format=json", {
    httpsAgent: agent,
    proxy: false,
  });
  console.log(res.data);
  console.log(beg, Date.now());
}

const testButton = async () => {
  const resp = await axios.post(
    "https://discord.com/api/v9/interactions",
    <ButtonData>{
      type: 3,
      guild_id: "936904237064007701",
      channel_id: "972658590668165160",
      message_id: "972658875469803520",
      application_id: "720351927581278219",
      session_id: " ",
      data: { component_type: 2, custom_id: "persistent:on_verify" },
    },
    {
      headers: {
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
      },
    }
  );
  console.log(resp);
};
// testButton();

export interface ButtonData {
  type: 3;
  guild_id: string;
  channel_id: string;
  message_id: string;
  application_id: string;
  session_id: string;
  data: { component_type: 2; custom_id: string };
}
