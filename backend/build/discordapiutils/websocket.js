"use strict";
//written by timlol#0001
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
exports.SocketTracker = void 0;
const ws_1 = require("ws");
const sendmessage_1 = require("./sendmessage");
const logger_1 = require("../utils/logger");
const other_1 = require("../utils/other");
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const webhook_1 = __importDefault(require("./webhook"));
const middleware_1 = require("../serverside/middleware");
const token = process.env.MY_TOKEN;
class SocketTracker {
    constructor(token, servers, url) {
        this.lastAck = Date.now();
        this.alreadyReacted = [];
        this.heartbeat = (ms) => {
            const beatInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                this.socket.send(JSON.stringify({ op: 1, d: (_a = this.lastSeq) !== null && _a !== void 0 ? _a : null }));
                yield (0, waitTime_1.default)(3);
                if (Date.now() > this.lastAck + 3000) {
                    (_b = this.wh) === null || _b === void 0 ? void 0 : _b.sendEvent(11, "Error: Zombied ACK, restarting tracking", "red");
                    this.reconnect();
                }
            }), ms);
            return beatInterval;
        };
        this.reconnect = () => {
            var _a;
            this.stop();
            this.socket = this.createSocket();
            (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendEvent(0, "Attempting at restarting tracking. If you see this and the bot runs fine afterwards please tell timlol", "red");
        };
        this.createSocket = () => {
            const sock = new ws_1.WebSocket("wss://gateway.discord.gg/?v=8&encoding=json");
            const payload = {
                op: 2,
                d: {
                    token: this.token,
                    // intents: 513,
                    properties: {
                        $os: "linux",
                        $browser: "chrome",
                        $device: "chrome",
                    },
                },
            };
            sock.on("open", () => {
                sock.send(JSON.stringify(payload));
                console.log("handshake opened for", this.token);
                console.log("Servers: ", this.servers.map((server) => {
                    return { name: server.name, tracking: server.tracking, settings: server.settings };
                }));
            });
            sock.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                let payload = JSON.parse(data);
                const { t, s, op, d } = payload;
                if (s)
                    this.lastSeq = s;
                switch (op) {
                    case 10:
                        const { heartbeat_interval } = d;
                        webhook_1.default.sentHeartbeat(this.url, heartbeat_interval, "purple");
                        this.hbInterval = this.heartbeat(heartbeat_interval);
                        break;
                    case 11:
                        this.lastAck = Date.now();
                        break;
                    case 7:
                        (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendEvent(op, "Reconnect Call received", "orange");
                        yield (0, waitTime_1.default)(1);
                        this.reconnect();
                        break;
                    case 6:
                        console.log("op 6 received ");
                        break;
                    case 1:
                        sock.send(JSON.stringify({ op: 1, d: null }));
                        (_b = this.wh) === null || _b === void 0 ? void 0 : _b.sendEvent(op, "Emergency heartbeat sent", "yellow");
                        break;
                    default:
                        break;
                }
                if (d) {
                    const server = this.servers.find((server) => d.guild_id === server.guildID);
                    switch (t) {
                        case "READY":
                            console.log("ready occured");
                            let payload = JSON.parse(data);
                            // console.log(payload.d.user);
                            this.user = payload.d.user;
                            this.session_id = payload.d.session_id;
                            console.log("session", this.session_id);
                            if (this.user) {
                                console.log(this.url);
                                this.wh = new webhook_1.default(this.token, this.url, this.user);
                                this.wh.sendUser(this.session_id);
                            }
                            break;
                        case "RECONNECT":
                            console.log("reconnect event occured");
                            (_c = this.wh) === null || _c === void 0 ? void 0 : _c.sendEvent("Reconnect request received", "Possibility of failure to reconnect to websocket may occur. Please contant timlol if it happens", "orange");
                            break;
                        case "RESUME":
                            console.log("resume response");
                            break;
                        case "MESSAGE_CREATE":
                            const author = d.author.username;
                            const channelOK = server && server.settings.channels.length >= 18 ? (server.settings.channels.includes(d.channel_id) ? true : false) : true;
                            if (server && d.author.id !== ((_d = this.user) === null || _d === void 0 ? void 0 : _d.id) && channelOK) {
                                const filters = server.filters;
                                const settings = server.settings;
                                const content = d.content;
                                const filter = settings.exactMatch
                                    ? filters.find((e) => e.filter.toUpperCase() == content.toUpperCase())
                                    : filters.find((e) => content.toUpperCase().includes(e.filter.toUpperCase()));
                                if (filter) {
                                    console.log(`${(0, logger_1.getTime)()} ${author} : ${content} --> ${filter.response}`);
                                    const rand = Math.floor(Math.random() * 100);
                                    if (rand < settings.percentResponse) {
                                        console.log("responding");
                                        yield (0, sendmessage_1.realType)(filter.response, d.channel_id, this.token, settings.responseTime, settings.reply, {
                                            channel_id: d.channel_id,
                                            guild_id: server.guildID,
                                            message_id: d.id,
                                        }).catch(() => {
                                            var _a;
                                            console.log("Error caught when trying to respond");
                                            (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendInteraction(t, "ERROR WHEN ATTEMPTING TO SEND MESSAGE, POSSIBLY DUE TO SLOWMODE", server, d.channel_id, d.message_id);
                                        });
                                        (_e = this.wh) === null || _e === void 0 ? void 0 : _e.sendInteraction(t, `Responded to message "${content}" with filter "${filter.response}"`, server, d.channel_id, d.id);
                                    }
                                }
                                else if (server.settings.useAI && checkAI(content, settings.percentResponse)) {
                                    console.log("generating AI");
                                    const response = yield (0, other_1.generateAIResponse)(content, settings.temperature).catch(() => {
                                        var _a;
                                        (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendInteraction(t, `ERROR GENERATING AI, ADJUST YOUR AI SPONTANEITY SETTING`, server, d.channel_id, d.id);
                                    });
                                    if (response) {
                                        console.log("AI response:", response);
                                        (_f = this.wh) === null || _f === void 0 ? void 0 : _f.sendInteraction(t, `Responding to message "${content}" with AI response "${response}"`, server, d.channel_id, d.id);
                                        yield (0, sendmessage_1.realType)(response, d.channel_id, this.token, settings.responseTime, settings.reply, {
                                            channel_id: d.channel_id,
                                            guild_id: server.guildID,
                                            message_id: d.id,
                                        }).catch(() => {
                                            var _a;
                                            console.log("Error caught when trying to respond");
                                            (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendInteraction(t, "ERROR WHEN ATTEMPTING TO SEND MESSAGE, POSSIBLY DUE TO SLOWMODE", server, d.channel_id, d.message_id);
                                        });
                                    }
                                }
                            }
                            break;
                        case "MESSAGE_REACTION_ADD":
                            const checkReact = d.message_id + encodeURIComponent(d.emoji.name);
                            if (server &&
                                server.settings.giveaway.includes(d.channel_id) &&
                                d.user_id != ((_g = this.user) === null || _g === void 0 ? void 0 : _g.id) &&
                                !this.alreadyReacted.includes(checkReact)) {
                                yield (0, waitTime_1.default)(3);
                                yield (0, sendmessage_1.reactMessage)(d.channel_id, d.message_id, d.emoji.name, this.token)
                                    .then((resp) => {
                                    var _a;
                                    console.log("reacted to giveaway channel", server.settings.giveaway, "with", d.emoji.name);
                                    const detail = `Reaction with ${d.emoji.name}`;
                                    this.alreadyReacted.push(checkReact);
                                    (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendInteraction(t, detail, server, d.channel_id, d.message_id);
                                    return resp;
                                })
                                    .catch(() => {
                                    var _a;
                                    console.log("react catch statement");
                                    (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendInteraction(t, "ERROR WHEN ATTEMPTING TO REACT TO MESSAGE", server, d.channel_id, d.message_id);
                                });
                            }
                            break;
                        default:
                            break;
                    }
                }
            }));
            sock.on("error", (err) => __awaiter(this, void 0, void 0, function* () {
                console.log("Web socket error occured");
                this.reconnect();
            }));
            return sock;
        };
        this.token = token;
        this.servers = servers;
        this.socket = this.createSocket();
        this.url = url;
    }
    stop() {
        var _a;
        this.socket.close();
        if (this.hbInterval)
            clearInterval(this.hbInterval);
        (_a = this.wh) === null || _a === void 0 ? void 0 : _a.sendEvent("Stopped tracker", "WebSocket stop event called", "black");
        return;
    }
}
exports.SocketTracker = SocketTracker;
const checkAI = (content, random) => {
    const rand = Math.floor(Math.random() * 100) < random;
    if (rand && content.length > 2 && content.length < 30 && !middleware_1.emojiRegex.test(content) && !/\d{18}/g.test(content))
        return true;
    return false;
};
