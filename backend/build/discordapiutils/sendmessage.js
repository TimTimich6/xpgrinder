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
exports.reactMessage = exports.testSend = exports.spamMessages = exports.deleteMessage = exports.realType = exports.startTyping = exports.postMessage = void 0;
const dataRetreriver_1 = require("./../utils/dataRetreriver");
const headers_1 = __importStar(require("./headers"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const axios_1 = __importDefault(require("axios"));
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const selfData_1 = require("./selfData");
const postMessage = (message, channelID, token, ref) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)(`https://discord.com/api/v9/channels/${channelID}/messages`, {
        headers: {
            cookie: yield (0, headers_1.getCookie)(),
            authorization: token,
            "content-type": "application/json",
        },
        agent: selfData_1.agent,
        body: JSON.stringify({ content: message, message_reference: ref ? ref : null }),
        method: "POST",
    });
    const body = yield response.json();
    if ("code" in body)
        throw new Error(body.message);
    return body;
});
exports.postMessage = postMessage;
const startTyping = (channelID, token) => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.post(`https://discord.com/api/v9/channels/${channelID}/typing`, undefined, {
        headers: Object.assign({ cookie: yield (0, headers_1.getCookie)(), authorization: token }, headers_1.default),
    });
});
exports.startTyping = startTyping;
const realType = (message, channelID, token, time, reply, ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, waitTime_1.default)(3);
    yield (0, exports.startTyping)(channelID, token);
    yield (0, waitTime_1.default)(time);
    let response;
    if (reply)
        response = yield (0, exports.postMessage)(message, channelID, token, ref);
    else
        response = yield (0, exports.postMessage)(message, channelID, token);
    return response;
});
exports.realType = realType;
// realType("hi", "961438859676221461", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8", 2, false);
const deleteMessage = (channelID, messageID, token) => __awaiter(void 0, void 0, void 0, function* () {
    axios_1.default
        .delete(`https://discord.com/api/v9/channels/${channelID}/messages/${messageID}`, {
        headers: Object.assign({ cookie: yield (0, headers_1.getCookie)(), authorization: token }, headers_1.default),
        httpsAgent: selfData_1.agent,
    })
        .catch((err) => console.log("error when deleting message"));
});
exports.deleteMessage = deleteMessage;
const spamMessages = (channelID, token, delay) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, dataRetreriver_1.getPaste)("FttucAdP").catch((err) => {
        console.log("failure to get sentences paste");
        return "Good Morning!";
    });
    const splitSentences = data.split("\r\n");
    const spamInterval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        const randIndex = Math.floor(Math.random() * splitSentences.length);
        const message = splitSentences[randIndex];
        const response = yield (0, exports.postMessage)(message, channelID, token).catch((err) => {
            console.log("error caught when sending random message");
            return null;
        });
        if (response) {
            yield (0, waitTime_1.default)(1);
            console.log("random: ", message, "for token", token.slice(0, 5));
            (0, exports.deleteMessage)(channelID, response.id, token);
        }
    }), delay * 1000);
    return spamInterval;
});
exports.spamMessages = spamMessages;
// spamMessages("936904237064007704", "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8", 5);
const testSend = (message, token, channelID) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, exports.postMessage)(message, channelID, token).catch((err) => null);
    if (!response)
        return false;
    yield (0, waitTime_1.default)(1);
    yield (0, exports.deleteMessage)(channelID, response.id, token).catch((err) => console.log("error when deleting a test message"));
    console.log("channel test successful");
    return true;
});
exports.testSend = testSend;
//https://apps.timwhitlock.info/emoji/tables/unicode
const reactMessage = (channelID, messageID, rxn, token) => __awaiter(void 0, void 0, void 0, function* () {
    const encoded = encodeURIComponent(rxn);
    const resp = yield axios_1.default
        .put(`https://discord.com/api/v9/channels/${channelID}/messages/${messageID}/reactions/${encoded}/%40me`, {}, {
        headers: Object.assign({ cookie: yield (0, headers_1.getCookie)(), authorization: token }, headers_1.default),
        httpsAgent: selfData_1.agent,
    })
        .catch((err) => {
        if (err.response && err.response.data)
            console.log("err reacting", err.response.data.code, err.response.data.message);
    });
});
exports.reactMessage = reactMessage;
// reactMessage("936904237064007704", "962440096618020864", "😆", "NTE2MzY5MTQzMDQ2MzQwNjA4.Yi5Jgw.Ixs8bay3l-HAYj5-z7ioSRdy46M");
