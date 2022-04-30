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
const auth_1 = require("./auth");
const mongo = __importStar(require("./mongocommands"));
const express_1 = __importDefault(require("express"));
const dataRetreriver_1 = require("../utils/dataRetreriver");
const getInviteData_1 = require("../discordapiutils/getInviteData");
const selfData_1 = require("../discordapiutils/selfData");
const websocket_1 = require("../discordapiutils/websocket");
const middleware_1 = require("./middleware");
const sendmessage_1 = require("../discordapiutils/sendmessage");
const inviter_1 = require("../discordapiutils/inviter");
const axios_1 = __importDefault(require("axios"));
const url_1 = __importDefault(require("url"));
const serverwebhook_1 = require("./serverwebhook");
const ip_1 = __importDefault(require("ip"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log(dotenv_1.default.config({}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const port = process.env.port || 3080;
const trackingArray = [];
const ongoingInvitations = [];
console.log(process.env.BASEURL);
const baseredirect = process.env.BASEURL || "https://xpgrinder.xyz/api/auth/redirect";
const authURL = `https://discord.com/api/oauth2/authorize?client_id=967841162905915452&redirect_uri=${encodeURIComponent(baseredirect)}&response_type=code&scope=identify%20guilds.members.read`;
app.get("/api/invite/:code", (req, res) => {
    const code = req.params.code;
    (0, getInviteData_1.getInviteData)(code)
        .then((data) => {
        console.log(data);
        res.status(200).json(data);
    })
        .catch((err) => {
        console.log("Failed axios");
        res.status(500).json({ title: "Invite Error", description: "Can't get data on invite" });
    });
});
app.post("/api/self/", auth_1.isAuthed, auth_1.hasRole, (req, res) => {
    const token = req.body.token;
    (0, selfData_1.selfData)(token)
        .then((data) => res.status(200).json(data))
        .catch(() => {
        res.status(500).json({ title: "Self data Error", description: "Failed to get data on the user" });
    });
});
app.get("/api/auth/discord", (req, res) => {
    res.redirect(authURL);
});
app.get("/api/user", auth_1.isAuthed, auth_1.hasRole, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        res.status(200).json(user);
    }
    else {
        res.status(500).json({ title: "User error", description: "Couldn't find user" });
    }
}));
app.get("/api/auth/redirect", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    const { code } = req.query;
    try {
        if (code) {
            const body = {
                client_id: "967841162905915452",
                client_secret: "wSGJRY3vUgdQrkF_ppKMxBaXZjQqjRlz",
                grant_type: "authorization_code",
                code: code.toString(),
                redirect_uri: process.env.BASEURL || "https://xpgrinder.xyz/",
            };
            const encoded = new url_1.default.URLSearchParams(body);
            const form = encoded.toString();
            const { data } = yield axios_1.default
                .post(`https://discord.com/api/oauth2/token`, form, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })
                .catch((err) => {
                var _a;
                if (axios_1.default.isAxiosError(err) && ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) == 400) {
                    return { data: err.response.data };
                }
                else {
                    console.log("unexpected error in invite: ", err);
                    throw new Error("An unexpected error occurred");
                }
            });
            if ("access_token" in data) {
                // const userResp = await axios
                //   .get<userData>("https://discord.com/api/v8/users/@me", { headers: { Authorization: "Bearer " + data.access_token } })
                //   .catch((err) => null);
                // if (userResp) {
                //   console.log(userResp.data);
                // }
                const memberData = yield axios_1.default
                    .get("https://discord.com/api/v8/users/@me/guilds/934702825328504843/member", {
                    headers: { Authorization: "Bearer " + data.access_token },
                })
                    .catch((err) => null);
                if (memberData) {
                    const user = memberData.data.user;
                    const result = yield mongo.getByUserid(memberData.data.user.id);
                    const token = jsonwebtoken_1.default.sign({ userid: memberData.data.user.id }, auth_1.secret, { expiresIn: "1d" });
                    res.cookie("jwt", token);
                    if (!result) {
                        yield mongo.createUser(user.id, user.username, data.access_token, data.refresh_token, user.avatar, memberData.data.roles);
                    }
                    else {
                        yield mongo.updateAccess(user.id, data.access_token, data.access_token, memberData.data.roles);
                    }
                    console.log(memberData.data);
                }
            }
            res.redirect(process.env.BASEURL ? "http://localhost:3000" : "https://xpgrinder.xyz/");
        }
    }
    catch (error) {
        return res.status(500).json({ title: "Auth error", description: "Code not found" });
    } // https:discord.com/api/oauth2/authorize?client_id=967841162905915452&redirect_uri=http%3A%2F%2Flocalhost%3A3080%2Fapi%2Fauth%2Fredirect&response_type=code&scope=guilds.members.read%20identify
}));
app.get("/api/protectedroute", auth_1.isAuthed, (req, res) => {
    res.send("200");
});
app.post("/api/track", auth_1.isAuthed, auth_1.hasRole, middleware_1.checkTracking, middleware_1.testWebhook, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const servers = req.body.servers;
    const token = req.body.token;
    const userid = req.jwt.userid;
    const storage = trackingArray.find((el) => el.userid == userid);
    if (storage) {
        if (storage.websocket)
            storage.websocket.stop();
        if (storage.intervals && storage.intervals.length > 0)
            storage.intervals.forEach((interval) => clearInterval(interval));
        trackingArray.splice(trackingArray.indexOf(storage), 1);
    }
    let storageCell = { userid };
    const spamServers = servers.filter((server) => server.settings.spamChannel.length == 18 && server.tracking);
    const regularTrack = servers.filter((server) => server.settings.spamChannel.length != 18 && server.tracking);
    if (regularTrack.length > 0) {
        const socket = new websocket_1.SocketTracker(req.body.token, regularTrack, req.body.webhook);
        if (socket)
            storageCell.websocket = socket;
    }
    if (spamServers.length > 0) {
        let spamIntervals = [];
        for (const server of spamServers) {
            const test = yield (0, sendmessage_1.testSend)("Hi everyone!", token, server.settings.spamChannel);
            if (!test) {
                console.log("sending failure");
                res.status(403).json({ title: "Spam Error", description: "Spamming channel couldn't be accessed" });
                return next();
            }
            spamIntervals.push(yield (0, sendmessage_1.spamMessages)(server.settings.spamChannel, req.body.token, server.settings.responseTime));
        }
        storageCell.intervals = spamIntervals;
    }
    trackingArray.push(storageCell);
    console.log("LENGTH OF TRACKING AFTER ADD:", trackingArray.length);
    console.log(trackingArray.map((elem) => elem.userid));
    mongo.overwriteServers(userid, servers, true);
    mongo.updateWebhookAndToken(userid, req.body.webhook, req.body.token);
    res.status(200).json(req.body);
}));
app.delete("/api/track", auth_1.isAuthed, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { servers } = req.body;
    const userid = req.jwt.userid;
    const storage = trackingArray.find((element) => element.userid == userid);
    if (storage) {
        console.log("removing servers from userid: ", userid, "index: ", trackingArray.indexOf(storage));
        if (storage.websocket)
            storage.websocket.stop();
        if (storage.intervals && storage.intervals.length > 0)
            storage.intervals.forEach((interval) => clearInterval(interval));
        trackingArray.splice(trackingArray.indexOf(storage), 1);
        console.log(trackingArray.map((elem) => elem.userid));
    }
    console.log("LENGTH OF TRACKING AFTER DELETE:", trackingArray.length);
    yield mongo.overwriteServers(userid, servers, false);
    res.status(200).json({ userid, message: "stop tracking all servers" });
}));
app.delete("/api/servers", auth_1.isAuthed, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.jwt.userid;
    const storage = trackingArray.find((element) => element.userid == userid);
    if (storage) {
        console.log("removing servers from userid: ", userid, "index: ", trackingArray.indexOf(storage));
        if (storage.websocket)
            storage.websocket.stop();
        if (storage.intervals && storage.intervals.length > 0)
            storage.intervals.forEach((interval) => clearInterval(interval));
        trackingArray.splice(trackingArray.indexOf(storage), 1);
        console.log(trackingArray.map((elem) => elem.userid));
    }
    yield mongo.overwriteServers(userid, req.body.servers, req.body.active);
    res.status(200).json("overwrote servers with body");
}));
app.get("/api/filters", auth_1.isAuthed, auth_1.hasRole, (req, res) => {
    (0, dataRetreriver_1.readBin)("62394f7e7caf5d67836efb23")
        .then((binData) => {
        const filters = binData.defaultFilters;
        res.status(200).send(filters);
    })
        .catch(() => {
        console.log("failed to get bin data");
        res.status(500).json({ title: "Filters Error", description: "Failed to fetch default filters" });
    });
});
app.post("/api/example", auth_1.isAuthed, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.jwt.userid;
    const { prompt, completion } = req.body;
    if (prompt.length <= 0 || completion.length <= 0)
        res.status(500).json({ title: "Upload Error", description: "Invalid upload data detected" });
    else {
        yield mongo.uploadExample(userid, { prompt, completion });
        res.status(200).json("Uploaded example successfully");
    }
}));
app.post("/api/invite", auth_1.isAuthed, auth_1.hasRole, middleware_1.checkInvite, middleware_1.checkUses, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.body;
    const userid = req.jwt.userid;
    const alreadyExists = ongoingInvitations.find((el) => (el.userid = userid));
    if (alreadyExists) {
        if (!alreadyExists.inviter.active)
            ongoingInvitations.filter((invitation) => invitation.userid != userid);
        else
            return res.status(500).json({ title: "Invite Error", description: "Invitation already sending out. Interrupt the previous process" });
    }
    const unique = yield (0, dataRetreriver_1.getRandomTokens)(params.amount);
    if (unique) {
        const inviteInstance = new inviter_1.Inviter(params, unique, userid);
        ongoingInvitations.push({ inviter: inviteInstance, userid });
        return res.status(200).send("success");
    }
    else
        return res.status(500).json({ title: "Invite Error", description: "Couldn't get tokens, try again or contact timlol" });
}));
app.delete("/api/invite", auth_1.isAuthed, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.jwt.userid;
    const inviteProcess = ongoingInvitations.find((element) => element.userid == userid);
    if (inviteProcess) {
        if (inviteProcess.inviter.active == false)
            return res.status(500).json({ title: "Invite Error", description: "No active process is happening" });
        inviteProcess.inviter.interrupt();
        return res.status(200).json("Successfully stopped");
    }
    else {
        return res.status(500).json({ title: "Invite Error", description: "Failed to interrupt inviter or no active process is happening" });
    }
}));
app.get("/api/servers", auth_1.isAuthed, (req, res) => {
    if (req.jwt.userid == "516369143046340608")
        res.status(200).json(trackingArray.map((elem) => elem.userid));
});
app.listen(port, () => {
    console.log("listening on port", port);
    console.log(ip_1.default.address());
    if (ip_1.default.address() != "192.168.0.238")
        (0, serverwebhook_1.restartHook)()
            .then(() => console.log("send start hook"))
            .catch(() => console.log("failed to send restart hook"));
});
