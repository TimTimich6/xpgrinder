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
const axios_1 = __importDefault(require("axios"));
// import axiosRetry from 'axios-retry';
// axiosRetry(axios, { retries: 3 });
const httpClient = axios_1.default.create();
httpClient.defaults.timeout = 15000;
exports.default = (code) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('in axios');
    const server_invite = yield axios_1.default
        .get(`https://discord.com/api/v9/invites/${code}`)
        .catch((err) => console.log('Failed axios'));
    const data = server_invite.data;
    const guildID = data.guild.id;
    const iconHash = data.guild.icon;
    const serverIcon = `https://cdn.discordapp.com/icons/${guildID}/${iconHash}.png`;
    const guildName = data.guild.name;
    const channelDefault = data.channel.id;
    return { guildID, iconHash, serverIcon, guildName, channelDefault };
});
