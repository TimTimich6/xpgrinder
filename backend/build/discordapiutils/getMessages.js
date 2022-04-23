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
exports.getMessages = void 0;
const axios_1 = __importDefault(require("axios"));
const headers_1 = __importDefault(require("./headers"));
const getMessages = (channelID, limit = 1, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield axios_1.default.get(`https://discord.com/api/v9/channels/${channelID}/messages?limit=${limit}`, {
        headers: Object.assign({ authorization: token }, headers_1.default),
    });
    const messages = resp.data;
    return messages;
});
exports.getMessages = getMessages;
(0, exports.getMessages)("95790573247125500", 1, "NTA2Mjc0ODAwMDI5NjYzMjYz.Yim9Gg.Kz0dy9xtXCSEZv95_-O6vAvBlD8")
    .then((response) => {
    console.log(response);
})
    .catch((err) => {
    console.log("ERROR: ", err.response.data.message, "CODE: ", err.response.data.code);
});
