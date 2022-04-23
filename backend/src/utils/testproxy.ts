import fetch from "node-fetch";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
const proxy = "http://DavidL:WhiteWalter@geo.iproyal.com:12323";
const agent = new HttpsProxyAgent(proxy);
async function testProxy() {
  const res = await fetch("https://api.ipify.org?format=json", {
    method: "GET",
    agent: agent,
  }).then((resRaw) => resRaw.json());
  console.log(res);
}

async function testProxy2() {
  const res = await axios.get("https://api.ipify.org?format=json", {
    httpsAgent: agent,
  });
  console.log(res.data);
}

// testProxy2();
