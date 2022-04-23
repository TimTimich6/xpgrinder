import { InviteRequest } from "./../serverside/middleware";
import axios from "axios";
import { ColorToInt } from "./webhook";
export class InviterWebhook {
  constructor(readonly params: InviteRequest) {}

  async sendInitialization() {
    const decimalColor = parseInt(ColorToInt["purple"], 16);
    const body = {
      content: null,
      embeds: [
        {
          title: this.params.guildName,
          description: "Starting to invite...",
          color: decimalColor,
          fields: [
            {
              name: "Invite Code",
              value: this.params.inviteLink.split(".gg/")[1],
              inline: true,
            },
            {
              name: "Amount",
              value: this.params.amount,
              inline: true,
            },
            {
              name: "Captcha Tries",
              value: this.params.captcha,
              inline: true,
            },
            {
              name: "Delay",
              value: `${this.params.delay} seconds`,
              inline: true,
            },
            {
              name: "Reaction",
              value: this.params.reaction || "None",
              inline: true,
            },
            {
              name: "Message To Send",
              value: this.params.message || "None",
              inline: true,
            },
          ],
          footer: {
            text: "https://xpgrinder.xyz",
          },
          thumbnail: {
            url: this.params.serverLogo,
          },
        },
      ],
      username: "WhitelistAIO Inviter V2",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
      attachments: [],
    };
    const jsonToSend = JSON.stringify(body);
    axios
      .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
      .catch((err) => console.log("err: ", err.response.data));
  }
  async sendJoin(success: boolean, token: string, index: number) {
    const decimalColor = success ? parseInt(ColorToInt["green"], 16) : parseInt(ColorToInt["red"], 16);
    const body = {
      content: null,
      embeds: [
        {
          title: this.params.guildName,
          description: success ? "Token successfully joined" : "Token failed to join",
          color: decimalColor,
          fields: [
            {
              name: "Token",
              value: `${token.slice(0, 8)}...`,
              inline: true,
            },
            {
              name: "Index",
              value: index,
              inline: true,
            },
          ],
          footer: {
            text: "https://xpgrinder.xyz",
          },
          thumbnail: {
            url: this.params.serverLogo,
          },
        },
      ],
      username: "WhitelistAIO Inviter V2",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
      attachments: [],
    };
    const jsonToSend = JSON.stringify(body);
    axios
      .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
      .catch((err) => console.log("err: ", err.response.data));
  }
  async sendStop(index: number) {
    const decimalColor = parseInt(ColorToInt["black"], 16);
    const body = {
      content: null,
      embeds: [
        {
          title: this.params.guildName,
          description: "Stopped inviting after index " + index,
          color: decimalColor,
          footer: {
            text: "https://xpgrinder.xyz",
          },
          thumbnail: {
            url: this.params.serverLogo,
          },
        },
      ],
      username: "WhitelistAIO Inviter V2",
      avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
      attachments: [],
    };
    const jsonToSend = JSON.stringify(body);
    axios
      .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
      .catch((err) => console.log("err: ", err.response.data));
  }
}
