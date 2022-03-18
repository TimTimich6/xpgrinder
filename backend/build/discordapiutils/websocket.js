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
exports.trackserver = void 0;
const ws_1 = __importDefault(require("ws"));
const sendmessage_1 = require("./sendmessage");
const cleverBotAPI_1 = require("../cleverBotAPI");
const logger_1 = require("../utils/logger");
const token = process.env.MY_TOKEN;
//indentifying payload sent
const trackserver = (guildID, token, filters, settings, user) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(filters);
    const payload = {
        op: 2,
        d: {
            token: token,
            // intents: 513,
            properties: {
                $os: "linux",
                $browser: "chrome",
                $device: "chrome",
            },
        },
    };
    const ws = new ws_1.default("wss://gateway.discord.gg/?v=8&encoding=json");
    ws.on("open", () => {
        ws.send(JSON.stringify(payload));
        console.log("handshake opened");
    });
    ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let payload = JSON.parse(data);
        const { t, s, op, d } = payload;
        // console.log(payload);
        switch (op) {
            case 10:
                const { heartbeat_interval } = d;
                heartbeat(heartbeat_interval);
                console.log("beat");
                break;
            default:
                break;
        }
        switch (t) {
            case "MESSAGE_CREATE":
                const author = d.author.username;
                // console.log(d);
                if (d.guild_id === guildID && d.author.id !== user) {
                    //&& d.author.id !== "516369143046340608"
                    const content = d.content;
                    console.log((0, logger_1.getTime)(), author, ": ", content);
                    console.log(filters);
                    if (filters.some((e) => e.filter.toUpperCase() == content.toUpperCase())) {
                        const filter = filters.find((e) => e.filter.toUpperCase() == content.toUpperCase());
                        console.log((0, logger_1.getTime)(), "responding with:", filter.response);
                        yield (0, sendmessage_1.realType)(filter.response, d.channel_id, token, 6, settings.reply, {
                            channel_id: d.channel_id,
                            guild_id: guildID,
                            message_id: d.id,
                        });
                    }
                    else if (settings.useAI) {
                        const output = yield (0, cleverBotAPI_1.receiveMessage)(d.content);
                        console.log((0, logger_1.getTime)(), "responding with:", output);
                        yield (0, sendmessage_1.realType)(output, d.channel_id, token, 6, settings.reply, {
                            channel_id: d.channel_id,
                            guild_id: guildID,
                            message_id: d.id,
                        });
                    }
                    // const output: string = await receiveMessage(d.content);
                    // await realType(output, d.channel_id, token, 6);
                }
                break;
            default:
                break;
        }
    }));
    const heartbeat = (ms) => {
        return setInterval(() => {
            ws.send(JSON.stringify({ op: 1, d: null }));
        }, ms);
    };
});
exports.trackserver = trackserver;
// trackserver();
