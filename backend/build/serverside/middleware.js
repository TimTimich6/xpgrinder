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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authKey = exports.checkInvite = exports.checkTracking = exports.emojiRegex = exports.getTokens = void 0;
const dataRetreriver_1 = require("../utils/dataRetreriver");
const getTokens = () => __awaiter(void 0, void 0, void 0, function* () { });
exports.getTokens = getTokens;
exports.emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
const channelsRegex = /^\d{18}(?:\s+\d{18})*$/g;
const channelRegex = /^\d{18}$/g;
const tokenRegex = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d{18}\/[^\s]{68}\/?/;
const checkTracking = (req, res, next) => {
    const body = req.body;
    const { token, servers } = body;
    let trackingcount = 0;
    for (let index = 0; index < servers.length; index++) {
        const server = servers[index];
        const { filters, settings } = server;
        const channels = settings.channels.trim();
        if (server.tracking)
            trackingcount++;
        if (typeof settings.giveaway == "undefined")
            return res.status(500).json({ title: "Outdated version", description: `Set any value for giveaway to fix error for ${server.name}`, code: 15 });
        else if (settings.useAI && (settings.temperature > 100 || settings.temperature <= 0 || isNaN(settings.temperature)))
            return res.status(500).json({ title: "Settings error", description: `AI Spontaneity must be within 1-100 for ${server.name}`, code: 20 });
        else if (filters.some((filter) => !filter.filter || !filter.response))
            return res.status(500).json({ title: "Filter error", description: `Filters provided are either empty of invalid for ${server.name}`, code: 2 });
        else if (settings.percentResponse <= 0 || settings.percentResponse > 100 || isNaN(settings.percentResponse))
            return res.status(500).json({ title: "Settings error", description: `Response time  ${server.name}`, code: 13 });
        else if (settings.giveaway.length > 0 && !settings.giveaway.trim().match(channelsRegex))
            return res.status(500).json({ title: "Settings error", description: `Giveaway Channels don't pass the regex for ${server.name}`, code: 14 });
        else if (settings.useAI == false && !settings.giveaway.trim().match(channelsRegex) && filters.length == 0 && settings.spamChannel.length != 18)
            return res.status(500).json({ title: "Filter error", description: `No filters provided to work for ${server.name}`, code: 3 });
        else if (settings.spamChannel.length > 0 && !settings.spamChannel.trim().match(channelRegex))
            return res.status(500).json({ title: "Settings error", description: `Spam Channel regex didn't pass for ${server.name}`, code: 10 });
        else if (settings.spamChannel.trim().match(channelRegex) &&
            (settings.responseTime <= 0 || settings.responseTime >= 120 || isNaN(settings.responseTime)))
            return res.status(500).json({ title: "Settings error", description: `Response time provided is out of range for ${server.name}`, code: 4 });
        else if (!settings.channels.trim().match(channelsRegex) && settings.useAI)
            return res.status(500).json({ title: "Settings error", description: `You must have specific channels to use AI for ${server.name}`, code: 11 });
        else if (settings.useAI && settings.percentResponse > 15)
            return res
                .status(500)
                .json({ title: "Settings error", description: `Percent response must be range (0,15] when using AI for ${server.name}`, code: 12 });
        else if (settings.spamChannel.length == 18 && (settings.responseTime < 5 || settings.responseTime > 120))
            return res.status(500).json({ title: "Settings Error", description: `Spam Channel is set but typing time is out of range`, code: 8 });
        else if (settings.percentResponse <= 0 || settings.percentResponse > 100)
            return res.status(500).json({ title: "Settings error", description: `Percent response provided is out of range for ${server.name}`, code: 6 });
        else if (channels.length > 0 && !channels.trim().match(channelsRegex))
            return res.status(500).json({ title: "Settings error", description: `Specific Channels don't pass the regex for ${server.name}`, code: 9 });
    }
    if (!token || token == "N/A")
        return res.status(500).json({ title: "Token Error", description: "Token provided is either invalid or not found", code: 1 });
    else if (servers.length > 7 || servers.length <= 0)
        return res.status(500).json({ title: "Servers Error", description: `Total server count out of range [0-7]`, code: 5 });
    else if (!token.trim().match(tokenRegex))
        res.status(500).json({ title: "Token Error", description: `Token failed regex requirement`, code: 5 });
    else if (trackingcount <= 0 || trackingcount > 5)
        return res.status(500).json({ title: "Servers Error", description: `Tracking servers count out of range [1 - 5]`, code: 7 });
    else if (!webhookRegex.test(body.webhook))
        res.status(500).json({ title: "Webhook Error", description: `Webhook doesn't pass regex`, code: 19 });
    if (!res.headersSent)
        next();
};
exports.checkTracking = checkTracking;
const checkInvite = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const params = req.body;
    const keys = Object.keys(params);
    if (!keys.includes("amount"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("captcha"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("channelID"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("delay"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("guildID"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("inviteLink"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("messageID"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("message"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("reaction"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("webhook"))
        return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    params.channelID = params.channelID.trim();
    params.guildID = params.guildID.trim();
    params.messageID = params.messageID.trim();
    params.reaction = params.reaction.trim();
    params.message = params.message.trim();
    params.inviteLink = params.inviteLink.trim();
    params.webhook = params.webhook.trim();
    if (params.amount <= 0 || params.amount >= 16)
        return res.status(500).json({ title: "Invite error", description: `Amount is out of range [1,15]` });
    if (!params.webhook.match(webhookRegex))
        return res.status(500).json({ title: "Invite error", description: `Webhook is not valid` });
    if (params.delay <= 1 || params.delay >= 120)
        return res.status(500).json({ title: "Invite error", description: `Delay is out of range [2,120]` });
    if (!channelRegex.test(params.guildID))
        return res.status(500).json({ title: "Invite error", description: `GuildID is not valid` });
    if (!invRegex.test(params.inviteLink))
        return res.status(500).json({ title: "Invite error", description: `Invite link is not valid` });
    if (params.captcha <= 0 || params.captcha >= 4)
        return res.status(500).json({ title: "Invite error", description: `Captcha is out of range [1,3]` });
    if (params.reaction.length >= 1 && !params.reaction.match(exports.emojiRegex))
        return res.status(500).json({ title: "Invite error", description: `Reaction emoji is invalid` });
    if (params.reaction.match(exports.emojiRegex) && (!params.messageID.match(channelRegex) || !params.channelID.match(channelRegex)))
        return res.status(500).json({ title: "Invite error", description: `Reaction is present but messageID or channelID are not valid` });
    if (params.reaction.match(exports.emojiRegex) && (!params.messageID.match(channelRegex) || !params.channelID.match(channelRegex)))
        return res.status(500).json({ title: "Invite error", description: `Reaction is present but messageID or channelID are not valid` });
    if (params.message.length >= 1 && !params.channelID.match(channelRegex))
        return res.status(500).json({ title: "Invite error", description: `Message to send is present but channelID is not valid` });
    next();
});
exports.checkInvite = checkInvite;
const authKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.headers["testing-key"];
    const data = yield (0, dataRetreriver_1.getPaste)("WHBfhqt7").catch((err) => {
        res.status(500).json({ title: "Server Error", description: "Internal server error occured when getting keys" });
        return null;
    });
    if (data) {
        const splitTokens = data.split("\r\n");
        if (key && splitTokens.includes(key)) {
            console.log("key found: ", key);
            next();
        }
        else {
            console.log("key not found:", key);
            res.status(404).json({ title: "Key not found", description: "Enter a valid key to use the XP Grinder" });
        }
    }
});
exports.authKey = authKey;
