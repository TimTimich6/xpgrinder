import waitTime from "../utils/waitTime";
import { InviteRequest } from "./../serverside/middleware";
import { InviterWebhook } from "./inviterWebhook";
import { invite } from "./invitetoken";
export class Inviter {
  webhook: InviterWebhook;
  active: boolean = true;
  currentIndex: number = 0;
  constructor(readonly params: InviteRequest, readonly tokens: string[]) {
    this.webhook = new InviterWebhook(params);
    this.webhook.sendInitialization();
    if (this.params.concurrent) this.startConcurrent();
    else this.startConsecutive();
  }
  startConcurrent() {}
  async startConsecutive() {
    for (let index = 0; index < this.params.amount; index++) {
      this.currentIndex = index;
      if (!this.active) {
        this.webhook.sendStop(index);
        break;
      }
      const token = this.tokens[index];
      const inviteFeedback = await invite(this.params.inviteLink, "OTU5NzczMzkzNDIxNDc1OTIw.YkgwqA.RHz4zxoFOGUXXyc1rw0W8nlpmPc", this.params.captcha);
      console.log("feedback", inviteFeedback);
      if (inviteFeedback == 1) this.webhook.sendJoin(true, token, index + 1);
      if (inviteFeedback < 1) this.webhook.sendJoin(false, token, index + 1);
      waitTime(this.params.delay);
    }
  }
  interrupt() {
    this.active = false;
    return this.currentIndex;
  }
}
