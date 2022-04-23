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
const node_fetch_1 = __importDefault(require("node-fetch"));
const axios_1 = __importDefault(require("axios"));
const https_proxy_agent_1 = require("https-proxy-agent");
const proxy = "http://DavidL:WhiteWalter@geo.iproyal.com:12323";
const agent = new https_proxy_agent_1.HttpsProxyAgent(proxy);
function testProxy() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, node_fetch_1.default)("https://api.ipify.org?format=json", {
            method: "GET",
            agent: agent,
        }).then((resRaw) => resRaw.json());
        console.log(res);
    });
}
function testProxy2() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.get("https://api.ipify.org?format=json", {
            httpsAgent: agent,
        });
        console.log(res.data);
    });
}
// testProxy2();
