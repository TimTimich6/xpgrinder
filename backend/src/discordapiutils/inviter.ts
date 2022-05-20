import { addUses } from "../serverside/mongocommands";
import waitTime from "../utils/waitTime";
import { InviteRequest } from "./../serverside/middleware";
import { InviterWebhook } from "./inviterWebhook";
import { invite } from "./invitetoken";
import { agent } from "./selfData";
import { reactMessage, realType } from "./sendmessage";
export class Inviter {
  webhook: InviterWebhook;
  active: boolean = true;
  currentIndex: number = 0;
  successful = 0;
  ongoing: Promise<void>[] = [];
  constructor(readonly params: InviteRequest, readonly tokens: string[], readonly userid: string) {
    this.webhook = new InviterWebhook(params);
    this.webhook.sendInitialization();
    if (this.params.concurrent) this.startConcurrent();
    else this.startConsecutive();
  }
  async startConcurrent() {
    for (let index = 0; index < this.params.amount; index++) {
      this.currentIndex = index;
      if (!this.active) {
        this.webhook.sendStop(index, null);
        console.log("here");

        addUses(this.userid, this.params.amount);
        return;
      }

      const token = this.tokens[Math.floor(Math.random() * this.tokens.length)];
      const response = invite(this.params.inviteLink, token, this.params.captcha, this.webhook, agent, undefined)
        .then(async (feedback) => {
          if (feedback >= 1) {
            this.successful++;
            console.log("first try success");

            await this.webhook.sendJoin(true, token, index + 1, feedback);
            await waitTime(1);
            if (this.params.reaction)
              await reactMessage(this.params.channelID, this.params.messageID, this.params.reaction, token, null).catch(() =>
                console.log("failed to react upon joining")
              );
            if (this.params.message)
              realType(this.params.message, this.params.channelID, token, 4, false).catch(() => console.log("failed to message upon joining"));
          } else {
            for (let index = 0; index < 4; index++) {
              console.log("retrying again");
              const newtoken = this.tokens[Math.floor(Math.random() * this.tokens.length)];
              const resp = await invite(this.params.inviteLink, newtoken, this.params.captcha, this.webhook, agent, undefined);
              if (resp >= 1) {
                console.log("retry success");
                this.successful++;
                await this.webhook.sendJoin(true, newtoken, index + 1, resp);

                await waitTime(1);
                if (this.params.reaction)
                  await reactMessage(this.params.channelID, this.params.messageID, this.params.reaction, newtoken, null).catch(() =>
                    console.log("failed to react upon joining")
                  );
                if (this.params.message)
                  realType(this.params.message, this.params.channelID, newtoken, 4, false).catch(() => console.log("failed to message upon joining"));
                return;
              } else {
                continue;
              }
            }
            console.log("done retrying");
            this.webhook.sendJoin(false, "", index + 1, -3);
          }
        })
        .catch((err) => {
          console.log("invite error caught:", err);
          this.webhook.sendJoin(false, token, index + 1, -3);
        });
      this.ongoing.push(response);
      await waitTime(this.params.delay);
    }
    await Promise.all(this.ongoing);
    this.active = false;
    this.webhook.sendStop(this.params.amount, this.successful);
    addUses(this.userid, this.successful);

    return;
  }
  async startConsecutive() {
    for (let index = 0; index < this.params.amount; index++) {
      this.currentIndex = index;
      if (!this.active) {
        this.webhook.sendStop(index, null);
        addUses(this.userid, this.successful);
        return;
      }
      const token = this.tokens[Math.floor(Math.random() * this.tokens.length)];
      const inviteFeedback = await invite(this.params.inviteLink, token, this.params.captcha, this.webhook, agent, undefined).catch((err) => {
        console.log("invite error caught:", err);
        return -3;
      });
      console.log("feedback", inviteFeedback);
      if (inviteFeedback >= 1) {
        this.successful++;
        await waitTime(1);
        if (this.params.reaction)
          await reactMessage(this.params.channelID, this.params.messageID, this.params.reaction, token, null).catch(() =>
            console.log("failed to react upon joining")
          );
        if (this.params.message)
          realType(this.params.message, this.params.channelID, token, 4, false).catch(() => console.log("failed to message upon joining"));
      }
      const join = inviteFeedback >= 1 ? true : false;
      await this.webhook.sendJoin(join, token, index + 1, inviteFeedback);
      waitTime(this.params.delay);
    }
    this.active = false;
    this.webhook.sendStop(this.params.amount, this.successful);
    addUses(this.userid, this.successful);
    return;
  }
  interrupt() {
    this.active = false;
    return this.currentIndex;
  }
}

//"OTU5NzczMzkzNDIxNDc1OTIw.YkgwqA.RHz4zxoFOGUXXyc1rw0W8nlpmPc"
