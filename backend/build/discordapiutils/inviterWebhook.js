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
exports.InviterWebhook = void 0;
const axios_1 = __importDefault(require("axios"));
const webhook_1 = require("./webhook");
const selfData_1 = require("./selfData");
class InviterWebhook {
    constructor(params) {
        this.params = params;
    }
    sendInitialization() {
        return __awaiter(this, void 0, void 0, function* () {
            const decimalColor = parseInt(webhook_1.ColorToInt["purple"], 16);
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
            yield axios_1.default
                .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
                .catch((err) => console.log("err: ", err.response.data));
        });
    }
    sendJoin(success, token, index, feedback) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimalColor = success ? parseInt(webhook_1.ColorToInt["green"], 16) : parseInt(webhook_1.ColorToInt["red"], 16);
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
                                value: `${token.slice(0, 10)}...`,
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
                    },
                ],
                username: "WhitelistAIO Inviter V2",
                avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
                attachments: [],
            };
            if (this.params.verbose)
                body.embeds[0].fields.push({
                    name: "Status",
                    value: statusToSolution(feedback),
                    inline: true,
                });
            if (success) {
                const data = yield (0, selfData_1.getTokenProxy)(token);
                if (data) {
                    body.embeds[0].fields.push({
                        name: "User ID",
                        value: data.id,
                        inline: true,
                    });
                    body.embeds[0].author = {
                        name: `${data.username}#${data.discriminator}`,
                        icon_url: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=4096`,
                    };
                }
                else
                    console.log("here");
            }
            const jsonToSend = JSON.stringify(body);
            yield axios_1.default
                .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
                .catch((err) => console.log("err: ", err.response.data));
        });
    }
    sendCaptcha(captchaRequest, captchaSolve) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimalColor = parseInt(webhook_1.ColorToInt["orange"], 16);
            const body = {
                content: null,
                embeds: [
                    {
                        title: this.params.guildName,
                        description: "Captcha Data and solution",
                        color: decimalColor,
                        fields: [
                            {
                                name: "rqData",
                                value: captchaRequest.captcha_rqdata.slice(0, 10),
                                inline: true,
                            },
                            {
                                name: "rqToken",
                                value: captchaRequest.captcha_rqtoken.slice(0, 10),
                                inline: true,
                            },
                            {
                                name: "CaptchaKey",
                                value: captchaRequest.captcha_key[0],
                                inline: true,
                            },
                            {
                                name: "SiteKey",
                                value: captchaRequest.captcha_sitekey,
                                inline: true,
                            },
                            {
                                name: "Solution",
                                value: captchaSolve,
                                inline: false,
                            },
                        ],
                        footer: {
                            text: "https://xpgrinder.xyz",
                        },
                    },
                ],
                username: "WhitelistAIO Inviter V2",
                avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
                attachments: [],
            };
            const jsonToSend = JSON.stringify(body);
            yield axios_1.default
                .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
                .catch((err) => console.log("err: ", err.response.data));
        });
    }
    sendStop(index, successful) {
        return __awaiter(this, void 0, void 0, function* () {
            const decimalColor = parseInt(webhook_1.ColorToInt["black"], 16);
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
            if (typeof successful == "number" && successful >= 0)
                body.embeds[0].fields = [
                    {
                        name: "Succeeded",
                        value: `${successful} out of ${index}`,
                        inline: true,
                    },
                ];
            const jsonToSend = JSON.stringify(body);
            yield axios_1.default
                .post(this.params.webhook, jsonToSend, { headers: { "content-type": "application/json" } })
                .catch((err) => console.log("err: ", err.response.data));
        });
    }
}
exports.InviterWebhook = InviterWebhook;
function statusToSolution(status) {
    switch (status) {
        case -2:
            return "Captcha failed to solve";
        case -1:
            return "Token invalid";
        case 0:
            return "Captcha max attempts reached";
        case 1:
            return "Successful join";
        case 2:
            return "Could't bypass screen";
        default:
            return "Unkown status code";
    }
}
