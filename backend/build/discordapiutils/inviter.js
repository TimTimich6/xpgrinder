"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inviter = void 0;
class Inviter {
    constructor(inviteReq, tokens) {
        this.tokens = tokens;
        this.inviteLink = inviteReq.inviteLink;
        this.amount = inviteReq.amount;
        this.captcha = inviteReq.captcha;
        this.reaction = inviteReq.reaction;
        this.channelID = inviteReq.channelID;
        this.delay = inviteReq.delay;
        this.guildID = inviteReq.guildID;
        this.message = inviteReq.message;
        this.messageID = inviteReq.messageID;
        this.webhook = inviteReq.webhook;
    }
}
exports.Inviter = Inviter;
