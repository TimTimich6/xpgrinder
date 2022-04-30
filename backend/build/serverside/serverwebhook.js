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
exports.restartHook = void 0;
const axios_1 = __importDefault(require("axios"));
const url = "https://discord.com/api/webhooks/968774182659821598/hcz0M6w20-tu1ReG74fB-iQM28LhAuQGfiuN7psrmj7o4VOshGQgprua-7ZuTj1ow-oU";
function restartHook() {
    return __awaiter(this, void 0, void 0, function* () {
        const time = new Date(Date.now()).toLocaleTimeString();
        try {
            const body = {
                content: null,
                embeds: [
                    {
                        title: "Server Restarted",
                        description: "All trackings have been wiped",
                        color: null,
                        fields: [
                            {
                                name: "Time",
                                value: time,
                            },
                        ],
                    },
                ],
                username: "XP-GRINDER  Upstatus",
                avatar_url: "https://cdn.discordapp.com/icons/934702825328504843/92bdbd55c3939be81c290586d06f26a8.png?size=4096",
                attachments: [],
            };
            const jsonToSend = JSON.stringify(body);
            axios_1.default.post(url, jsonToSend, { headers: { "content-type": "application/json" } });
        }
        catch (error) {
            console.log("failed to send interaction");
        }
    });
}
exports.restartHook = restartHook;
