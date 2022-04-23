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
exports.getGuildData = exports.getInviteData = void 0;
const axios_1 = __importDefault(require("axios"));
const getInviteData = (code) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in axios for invite data");
    const { data } = yield axios_1.default.get(`https://discord.com/api/v9/invites/${code}`).catch((err) => {
        if (axios_1.default.isAxiosError(err)) {
            console.log("error message: ", err.message);
            throw new Error(err.message);
        }
        else {
            console.log("unexpected error: ", err);
            throw new Error("An unexpected error occurred");
        }
    });
    const guildID = data.guild.id;
    const iconHash = data.guild.icon;
    const serverIcon = `https://cdn.discordapp.com/icons/${guildID}/${iconHash}.png`;
    const guildName = data.guild.name;
    return { guildID, serverIcon, guildName };
});
exports.getInviteData = getInviteData;
const getGuildData = (guildID, token) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in axios for guild data");
    const { data } = yield axios_1.default
        .get(`https://discord.com/api/guilds/${guildID}?with_counts=true`, { headers: { authorization: token } })
        .catch((err) => {
        if (axios_1.default.isAxiosError(err)) {
            console.log("error message: ", err.message);
            throw new Error(err.message);
        }
        else {
            console.log("unexpected error: ", err);
            throw new Error("An unexpected error occurred");
        }
    });
    return data;
});
exports.getGuildData = getGuildData;
// getInviteData("4rPyXPPS");
// getGuildData("934702825328504843", "NTE2MzY5MTQzMDQ2MzQwNjA4.YkiK8Q.rzRmzkknTE5oaRYu3cOJACAqNqE");
