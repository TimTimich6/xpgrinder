import axios from "axios";
import { ColorToInt } from "../discordapiutils/webhook";

const url = "https://discord.com/api/webhooks/968774182659821598/hcz0M6w20-tu1ReG74fB-iQM28LhAuQGfiuN7psrmj7o4VOshGQgprua-7ZuTj1ow-oU";
export async function restartHook() {
  const time = new Date(Date.now()).toLocaleTimeString();
  try {
    const body = {
      content: null,
      embeds: [
        {
          title: "Server Restarted",
          description: "All trackings have been wiped",
          color: null,
          fields: [
            {
              name: "Time",
              value: time,
            },
          ],
        },
      ],
      username: "XP-GRINDER  Upstatus",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
      attachments: [],
    };
    const jsonToSend = JSON.stringify(body);
    axios.post(url, jsonToSend, { headers: { "content-type": "application/json" } });
  } catch (error) {
    console.log("failed to send interaction");
  }
}
