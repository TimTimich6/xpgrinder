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
const mongo = __importStar(require("./mongocommands"));
const express_1 = __importDefault(require("express"));
const dataRetreriver_1 = require("../utils/dataRetreriver");
const getInviteData_1 = require("../discordapiutils/getInviteData");
const selfData_1 = require("../discordapiutils/selfData");
const websocket_1 = require("../discordapiutils/websocket");
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = require("./middleware");
const sendmessage_1 = require("../discordapiutils/sendmessage");
const inviter_1 = require("../discordapiutils/inviter");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.port || 3080;
const trackingArray = [];
const ongoingInvitations = [];
app.get("/api/key", middleware_1.authKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const keyData = yield mongo.getUser(req.headers["testing-key"]);
    if (keyData)
        res.status(200).json({ userdata: keyData, key: req.headers["testing-key"] });
    else
        res.status(200).send("new key found");
}));
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
app.post("/api/self/", middleware_1.authKey, (req, res) => {
    const token = req.body.token;
    (0, selfData_1.selfData)(token)
        .then((data) => res.status(200).json(data))
        .catch(() => {
        res.status(500).json({ title: "Self data Error", description: "Failed to get data on the user" });
    });
});
app.post("/api/track", middleware_1.authKey, middleware_1.checkTracking, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const servers = req.body.servers;
    const token = req.body.token;
    const key = req.headers["testing-key"];
    if (trackingArray.some((storage) => storage.key == key))
        res.status(500).json({ title: "Tracking Error", description: "Instance already tracking" });
    else {
        let storageCell = { key };
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
        console.log(trackingArray.map((elem) => elem.key));
        req.body.key = key;
        yield mongo.replaceKey(req.body);
        res.status(200).json(req.body);
    }
}));
app.delete("/api/track", middleware_1.authKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { servers } = req.body;
    const key = req.headers["testing-key"];
    const storage = trackingArray.find((element) => element.key == key);
    if (storage) {
        console.log("removing servers from key: ", key, "index: ", trackingArray.indexOf(storage));
        if (storage.websocket)
            storage.websocket.stop();
        if (storage.intervals && storage.intervals.length > 0)
            storage.intervals.forEach((interval) => clearInterval(interval));
        trackingArray.splice(trackingArray.indexOf(storage), 1);
        res.status(200).json({ key, message: "stop tracking all servers" });
        console.log(trackingArray.map((elem) => elem.key));
    }
    else {
        res.status(500).json({ title: "Tracking Error", description: "Something went wrong when deactivating the tracking" });
    }
    console.log("LENGTH OF TRACKING AFTER DELETE:", trackingArray.length);
    yield mongo.clearTracking(key, servers);
}));
app.delete("/api/servers", middleware_1.authKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield mongo.overwriteServers(req.headers["testing-key"], req.body.servers);
    res.status(200).json("overwrote servers with body");
}));
app.get("/api/filters", middleware_1.authKey, (req, res) => {
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
app.get("/api/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield mongo.getUser("timkey"));
}));
app.post("/api/example", middleware_1.authKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt, completion } = req.body;
    if (prompt.length <= 0 || completion.length <= 0)
        res.status(500).json({ title: "Upload Error", description: "Invalid upload data detected" });
    else {
        yield mongo.uploadExample(req.headers["testing-key"], { prompt, completion });
        res.status(200).json("Uploaded example successfully");
    }
}));
app.post("/api/invite", middleware_1.checkInvite, middleware_1.authKey, middleware_1.checkUses, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.body;
    const key = req.headers["testing-key"];
    const alreadyExists = ongoingInvitations.find((el) => (el.key = key));
    if (alreadyExists) {
        if (!alreadyExists.inviter.active)
            ongoingInvitations.filter((invitation) => invitation.key != key);
        else
            return res.status(500).json({ title: "Invite Error", description: "Invitation already sending out. Interrupt the previous process" });
    }
    const unique = yield (0, dataRetreriver_1.getRandomTokens)(params.amount);
    if (unique) {
        const inviteInstance = new inviter_1.Inviter(params, unique, key);
        ongoingInvitations.push({ inviter: inviteInstance, key: req.headers["testing-key"] });
        return res.status(200).send("success");
    }
    else
        return res.status(500).json({ title: "Invite Error", description: "Couldn't get tokens, try again or contact timlol" });
}));
app.delete("/api/invite", middleware_1.authKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.headers["testing-key"];
    const inviteProcess = ongoingInvitations.find((element) => element.key == key);
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
app.get("/api/servers", (req, res) => {
    if (req.headers["testing-key"] == "timkey")
        res.status(200).json(trackingArray.map((elem) => elem.key));
    else
        res.status(403).json("unauthorized key");
});
app.listen(port, () => {
    console.log("listening on port", port);
});
//https://discord.com/oauth2/authorize?client_id=967841162905915452&redirect_uri=http%3A%2F%2Flocalhost%3A3080%2Fapi%2Fdiscord%2Fredirect&response_type=code&scope=identify%20guilds
