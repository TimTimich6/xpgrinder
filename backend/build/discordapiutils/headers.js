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
exports.xcontextproperties = exports.xsuperProperties = exports.secProps = exports.referer = exports.userAgent = exports.getCookie = void 0;
const axios_1 = __importDefault(require("axios"));
const getCookie = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("http://discord.com");
    // console.log(response);
    const cookieArray = response.headers["set-cookie"];
    const cookie = cookieArray.join(";");
    return cookie;
});
exports.getCookie = getCookie;
exports.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.263 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36";
exports.referer = "https://discord.com/channels/@me";
exports.secProps = {
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-fetch-dest": "empty",
};
exports.xsuperProperties = "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMC4wLjQ4OTYuODggU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6IjEwMC4wLjQ4OTYuODgiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHA6Ly8xMjcuMC4wLjE6NTUwMC8iLCJyZWZlcnJpbmdfZG9tYWluIjoiMTI3LjAuMC4xOjU1MDAiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTI0ODIzLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==";
exports.xcontextproperties = "eyJsb2NhdGlvbiI6IkpvaW4gR3VpbGQiLCJsb2NhdGlvbl9ndWlsZF9pZCI6IjkxNjUzNjExNjY4ODA4MDk4NyIsImxvY2F0aW9uX2NoYW5uZWxfaWQiOiI5MTc2OTAxMDcwOTAzMTMyMTYiLCJsb2NhdGlvbl9jaGFubmVsX3R5cGUiOjB9";
exports.default = Object.assign({ referer: exports.referer, "content-type": "application/json", "user-agent": exports.userAgent, "x-super-properties": exports.xsuperProperties, xcontextproperties: exports.xcontextproperties }, exports.secProps);
