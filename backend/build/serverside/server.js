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
const express_1 = __importDefault(require("express"));
const getInviteData_1 = __importDefault(require("../discordapiutils/getInviteData"));
const cors_1 = __importDefault(require("cors"));
const selfData_1 = require("../discordapiutils/selfData");
const websocket_1 = require("../discordapiutils/websocket");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const port = process.env.port || 3080;
app.get("/api/invite/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.params.code;
    const data = yield (0, getInviteData_1.default)(code);
    console.log(data);
    res.json(data);
}));
app.get("/api/self/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.params.token;
    const data = yield (0, selfData_1.selfData)(token);
    console.log(data);
    res.json(data);
}));
app.post("/api/track", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in track");
    const body = req.body;
    console.log(body);
    const { guildID, filters, token, userID, settings } = body;
    const finish = yield (0, websocket_1.trackserver)(guildID, token, filters, settings, userID);
    res.status(200).send(finish);
}));
app.listen(port, () => {
    console.log("listening on port", port);
});
