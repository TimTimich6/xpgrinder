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
exports.getTokenProxy = exports.selfData = exports.agent = void 0;
const axios_1 = __importDefault(require("axios"));
const headers_1 = __importStar(require("./headers"));
const https_proxy_agent_1 = require("https-proxy-agent");
const proxy = "http://DavidL:WhiteWalter@geo.iproyal.com:12323";
exports.agent = new https_proxy_agent_1.HttpsProxyAgent(proxy);
const selfData = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield axios_1.default
        .get("https://discord.com/api/v9/users/@me", {
        headers: Object.assign({ authorization: token, cookie: yield (0, headers_1.getCookie)() }, headers_1.default),
    })
        .then((resp) => {
        console.log("token used:", token);
        console.log("\tusername returned:", resp.data.username);
        console.log("\tid returned:", resp.data.id);
        return resp.data;
    });
    return res;
});
exports.selfData = selfData;
const getTokenProxy = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield axios_1.default
        .get("https://discord.com/api/v9/users/@me", {
        headers: Object.assign({ authorization: token, cookie: yield (0, headers_1.getCookie)() }, headers_1.default),
        httpsAgent: exports.agent,
    })
        .catch((err) => {
        console.log("error in getting user data with proxy");
        return null;
    });
    if (resp)
        return resp.data;
    return null;
});
exports.getTokenProxy = getTokenProxy;
// const token: string | undefined = process.env.MY_TOKEN;
// selfData(<string>token).then((userData: userData) => {
// 	console.log(userData);
// });
