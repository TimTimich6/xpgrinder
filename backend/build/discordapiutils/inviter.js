"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inviter = void 0;
const mongocommands_1 = require("../serverside/mongocommands");
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const inviterWebhook_1 = require("./inviterWebhook");
const invitetoken_1 = require("./invitetoken");
const selfData_1 = require("./selfData");
const sendmessage_1 = require("./sendmessage");
class Inviter {
    constructor(params, tokens, key) {
        this.params = params;
        this.tokens = tokens;
        this.key = key;
        this.active = true;
        this.currentIndex = 0;
        this.successful = 0;
        this.ongoing = [];
        this.webhook = new inviterWebhook_1.InviterWebhook(params);
        this.webhook.sendInitialization();
        if (this.params.concurrent)
            this.startConcurrent();
        else
            this.startConsecutive();
    }
    startConcurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < this.params.amount; index++) {
                this.currentIndex = index;
                if (!this.active) {
                    this.webhook.sendStop(index, null);
                    (0, mongocommands_1.addUses)(this.key, this.params.amount);
                    return;
                }
                const token = this.tokens[index];
                const response = (0, invitetoken_1.invite)(this.params.inviteLink, token, this.params.captcha, this.webhook, selfData_1.agent, undefined)
                    .then((feedback) => __awaiter(this, void 0, void 0, function* () {
                    if (feedback >= 1) {
                        this.successful++;
                        yield (0, waitTime_1.default)(1);
                        if (this.params.reaction)
                            yield (0, sendmessage_1.reactMessage)(this.params.channelID, this.params.messageID, this.params.reaction, token).catch(() => console.log("failed to react upon joining"));
                        if (this.params.message)
                            (0, sendmessage_1.realType)(this.params.message, this.params.channelID, token, 4, false).catch(() => console.log("failed to message upon joining"));
                    }
                    const join = feedback >= 1 ? true : false;
                    yield this.webhook.sendJoin(join, token, index + 1, feedback);
                }))
                    .catch(() => {
                    console.log("invite error caught");
                    this.webhook.sendJoin(false, token, index + 1, -3);
                });
                this.ongoing.push(response);
                yield (0, waitTime_1.default)(this.params.delay);
            }
            yield Promise.all(this.ongoing);
            this.active = false;
            this.webhook.sendStop(this.params.amount, this.successful);
            (0, mongocommands_1.addUses)(this.key, this.successful);
            return;
        });
    }
    startConsecutive() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < this.params.amount; index++) {
                this.currentIndex = index;
                if (!this.active) {
                    this.webhook.sendStop(index, null);
                    (0, mongocommands_1.addUses)(this.key, this.successful);
                    return;
                }
                const token = this.tokens[index];
                const inviteFeedback = yield (0, invitetoken_1.invite)(this.params.inviteLink, token, this.params.captcha, this.webhook, selfData_1.agent, undefined).catch(() => {
                    console.log("invite error caught");
                    return -3;
                });
                console.log("feedback", inviteFeedback);
                if (inviteFeedback >= 1) {
                    this.successful++;
                    yield (0, waitTime_1.default)(1);
                    if (this.params.reaction)
                        yield (0, sendmessage_1.reactMessage)(this.params.channelID, this.params.messageID, this.params.reaction, token).catch(() => console.log("failed to react upon joining"));
                    if (this.params.message)
                        (0, sendmessage_1.realType)(this.params.message, this.params.channelID, token, 4, false).catch(() => console.log("failed to message upon joining"));
                }
                const join = inviteFeedback >= 1 ? true : false;
                yield this.webhook.sendJoin(join, token, index + 1, inviteFeedback);
                (0, waitTime_1.default)(this.params.delay);
            }
            this.active = false;
            this.webhook.sendStop(this.params.amount, this.successful);
            (0, mongocommands_1.addUses)(this.key, this.successful);
            return;
        });
    }
    interrupt() {
        this.active = false;
        return this.currentIndex;
    }
}
exports.Inviter = Inviter;
//"OTU5NzczMzkzNDIxNDc1OTIw.YkgwqA.RHz4zxoFOGUXXyc1rw0W8nlpmPc"
