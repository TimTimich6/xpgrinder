"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.ColorToInt = void 0;
const axios_1 = __importDefault(require("axios"));
const headers_1 = __importStar(require("./headers"));
class WebHooks {
    constructor(token, url, user) {
        this.sendEvent = (title, description, color) => {
            const time = new Date(Date.now()).toLocaleTimeString();
            const decimalColor = parseInt(exports.ColorToInt[color], 16);
            const body = {
                content: null,
                embeds: [
                    {
                        title: "WebSocket Event",
                        description: description,
                        color: decimalColor,
                        fields: [
                            {
                                name: "Event",
                                value: title,
                            },
                        ],
                        author: {
                            name: this.user.username,
                            url: "https://xpgrinder.xyz/",
                            icon_url: `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png?size=4096`,
                        },
                        footer: {
                            text: time,
                        },
                    },
                ],
                username: "XP-GRINDER",
                avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
            };
            const jsonToSend = JSON.stringify(body);
            try {
                axios_1.default.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err send user: "));
            }
            catch (error) {
                console.log("failed to send event");
            }
        };
        this.sendUser = (sessionID) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const body = {
                content: null,
                embeds: [
                    {
                        title: this.token.substring(0, 6) + "...",
                        color: parseInt(exports.ColorToInt.purple, 16),
                        fields: [
                            {
                                name: "Username",
                                value: ((_a = this.user) === null || _a === void 0 ? void 0 : _a.username) + "#" + ((_b = this.user) === null || _b === void 0 ? void 0 : _b.discriminator),
                            },
                            {
                                name: "User ID",
                                value: (_c = this.user) === null || _c === void 0 ? void 0 : _c.id,
                            },
                            {
                                name: "Verified",
                                value: (_d = this.user) === null || _d === void 0 ? void 0 : _d.verified,
                            },
                            {
                                name: "Session ID",
                                value: sessionID,
                            },
                        ],
                        author: {
                            name: (_e = this.user) === null || _e === void 0 ? void 0 : _e.username,
                            url: "https://xpgrinder.xyz/",
                            icon_url: `https://cdn.discordapp.com/avatars/${(_f = this.user) === null || _f === void 0 ? void 0 : _f.id}/${(_g = this.user) === null || _g === void 0 ? void 0 : _g.avatar}.png?size=4096`,
                        },
                    },
                ],
                username: "XP-GRINDER",
                avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
            };
            const jsonToSend = JSON.stringify(body);
            try {
                axios_1.default.post(this.url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err send event: "));
            }
            catch (error) {
                console.log("failed to send user");
            }
        };
        this.sendInteraction = (type, extra, server, channelID, messageID) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const time = new Date(Date.now()).toLocaleTimeString();
            try {
                const resp = yield axios_1.default
                    .get(`https://discord.com/api/v9/guilds/${server.guildID}`, {
                    headers: Object.assign({ cookie: yield (0, headers_1.getCookie)(), authorization: this.token }, headers_1.default),
                })
                    .then((resp) => resp)
                    .catch((err) => {
                    console.log("err send interaction");
                });
                const body = {
                    content: null,
                    embeds: [
                        {
                            title: "Interaction Occurred",
                            color: parseInt(exports.ColorToInt.blue, 16),
                            fields: [
                                {
                                    name: "Type",
                                    value: type,
                                },
                                {
                                    name: "Data",
                                    value: extra,
                                },
                                {
                                    name: "Server",
                                    value: server.name,
                                    inline: true,
                                },
                                {
                                    name: "Channel",
                                    value: channelID,
                                    inline: true,
                                },
                                {
                                    name: "Message",
                                    value: messageID,
                                    inline: true,
                                },
                            ],
                            author: {
                                name: (_a = this.user) === null || _a === void 0 ? void 0 : _a.username,
                                url: "https://xpgrinder.xyz/",
                                icon_url: `https://cdn.discordapp.com/avatars/${(_b = this.user) === null || _b === void 0 ? void 0 : _b.id}/${(_c = this.user) === null || _c === void 0 ? void 0 : _c.avatar}.png?size=4096`,
                            },
                            footer: {
                                text: time,
                            },
                            thumbnail: {
                                url: `https://cdn.discordapp.com/icons/${server.guildID}/${resp === null || resp === void 0 ? void 0 : resp.data.icon}.png?size=4096`,
                            },
                        },
                    ],
                    username: "XP-GRINDER",
                    avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
                };
                const jsonToSend = JSON.stringify(body);
                axios_1.default
                    .post(this.url, jsonToSend, { headers: { "content-type": "application/json" } })
                    .catch((err) => console.log("error caught when sending interaction"));
            }
            catch (error) {
                console.log("failed to send interaction");
            }
        });
        this.token = token;
        this.url = url;
        this.user = user;
    }
}
exports.default = WebHooks;
WebHooks.sentHeartbeat = (url, ms, color) => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const decimalColor = parseInt(exports.ColorToInt[color], 16);
    const body = {
        content: null,
        embeds: [
            {
                title: "Heartbeat Interval Sent",
                description: "Initialized heartbeat with Discord Gateway",
                color: decimalColor,
                fields: [
                    {
                        name: "Interval",
                        value: `${ms} milliseconds`,
                    },
                ],
                footer: {
                    text: time,
                },
            },
        ],
        username: "XP-GRINDER",
        avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
    };
    const jsonToSend = JSON.stringify(body);
    try {
        axios_1.default.post(url, jsonToSend, { headers: { "content-type": "application/json" } }).catch((err) => console.log("err sent heartbeat: "));
    }
    catch (error) {
        console.log("failed to send heartbeat");
    }
};
exports.ColorToInt = {
    green: "9FE2BF",
    red: "DE3163",
    orange: "FF7F50",
    yellow: "DFFF00",
    blue: "6495ED",
    black: "0",
    purple: "A020F0",
};
