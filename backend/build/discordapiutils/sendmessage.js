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
exports.realType = exports.startTyping = exports.postMessage = void 0;
const headers_1 = __importStar(require("./headers"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const axios_1 = __importDefault(require("axios"));
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const postMessage = (message, channelID, token, ref) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, node_fetch_1.default)(`https://discord.com/api/v9/channels/${channelID}/messages`, {
        headers: {
            cookie: yield (0, headers_1.getCookie)(),
            authorization: token,
            "content-type": "application/json",
        },
        body: JSON.stringify({ content: message, message_reference: ref ? ref : null }),
        method: "POST",
    });
    return response;
});
exports.postMessage = postMessage;
// postReply("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg");
const startTyping = (channelID, token) => __awaiter(void 0, void 0, void 0, function* () {
    yield axios_1.default.post(`https://discord.com/api/v9/channels/${channelID}/typing`, undefined, {
        headers: Object.assign({ cookie: yield (0, headers_1.getCookie)(), authorization: token }, headers_1.default),
    });
});
exports.startTyping = startTyping;
const realType = (message, channelID, token, time, reply, ref) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, waitTime_1.default)(5);
    yield (0, exports.startTyping)(channelID, token);
    yield (0, waitTime_1.default)(time);
    let response;
    if (reply)
        response = yield (0, exports.postMessage)(message, channelID, token, ref);
    else
        response = yield (0, exports.postMessage)(message, channelID, token);
    const readStream = yield response.json();
    return readStream;
});
exports.realType = realType;
// realType("hi", "936904237064007704", "NTE2MzY5MTQzMDQ2MzQwNjA4.XZLCPg.iWJInN-nQJan6OD4a8zum6bVJIg", 1).then((resp) => {
//   console.log(resp);
// });
