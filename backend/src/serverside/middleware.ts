import { GeneralDiscordError } from "./../discordapiutils/invitetoken";
import axios, { AxiosError } from "axios";
import { checkNextReset, getUses, idData, setNextReset } from "./mongocommands";
import { NextFunction, Request, Response } from "express";
import { howManyHolding } from "../utils/other";
export const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
const invRegex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discordapp.com/invite)/.+[a-z]");
const channelsRegex = /^\d{18}(?:\s+\d{18})*$/g;
const channelRegex = /^\d{18}$/g;
const tokenRegex = /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/;
const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d{18}\/[^\s]{68}\/?/;

export const checkTracking = (req: any, res: Response, next: NextFunction) => {
  const body: idData = req.body;
  const { token, servers } = body;
  let trackingcount = 0;
  let aiuses = 0;
  const holderStatus: string = howManyHolding(req.user.roles);

  try {
    for (let index = 0; index < servers.length; index++) {
      const server = servers[index];
      const { filters, settings } = server;
      const channels = settings.channels.trim();
      if (server.tracking) trackingcount++;
      if (server.tracking && server.settings.useAI == true) aiuses++;
      if (
        typeof settings.giveaway == "undefined" ||
        typeof settings.blacklist == "undefined" ||
        typeof settings.whitelist == "undefined" ||
        typeof settings.mindelay == "undefined" ||
        typeof settings.maxdelay == "undefined"
      )
        return res
          .status(500)
          .json({ title: "Outdated server version", description: `Delete and add the server again to fix errors for ${server.name}`, code: 15 });
      else if (settings.useAI && (settings.temperature > 100 || settings.temperature <= 0 || isNaN(settings.temperature)))
        return res.status(500).json({ title: "Settings error", description: `AI Spontaneity must be within 1-100 for ${server.name}`, code: 20 });
      else if (filters.some((filter) => !filter.filter || !filter.response))
        return res
          .status(500)
          .json({ title: "Filter error", description: `Filters provided are either empty of invalid for ${server.name}`, code: 2 });
      else if (settings.percentResponse <= 0 || settings.percentResponse > 100 || isNaN(settings.percentResponse))
        return res.status(500).json({ title: "Settings error", description: `Response time  ${server.name}`, code: 13 });
      else if (settings.giveaway.length > 0 && !settings.giveaway.trim().match(channelsRegex))
        return res.status(500).json({ title: "Settings error", description: `Giveaway Channels don't pass the regex for ${server.name}`, code: 14 });
      else if (
        !settings.useAI &&
        server.tracking &&
        !settings.giveaway.trim().match(channelsRegex) &&
        filters.length == 0 &&
        settings.spamChannel.length != 18
      )
        return res.status(500).json({ title: "Filter error", description: `No filters provided to work for ${server.name}`, code: 3 });
      else if (settings.spamChannel.length > 0 && !settings.spamChannel.trim().match(channelRegex))
        return res.status(500).json({ title: "Settings error", description: `Spam Channel regex didn't pass for ${server.name}`, code: 10 });
      else if (
        settings.spamChannel.trim().match(channelRegex) &&
        (settings.responseTime <= 0 || settings.responseTime >= 120 || isNaN(settings.responseTime))
      )
        return res.status(500).json({ title: "Settings error", description: `Response time provided is out of range for ${server.name}`, code: 4 });
      else if (
        settings.mindelay < 0 ||
        settings.maxdelay >= 120 ||
        isNaN(settings.mindelay) ||
        isNaN(settings.maxdelay) ||
        settings.maxdelay < settings.mindelay
      )
        return res
          .status(500)
          .json({ title: "Settings error", description: `Min and Max delay values are out of range [0,120]for ${server.name}`, code: 26 });
      else if (!settings.channels.trim().match(channelsRegex) && settings.useAI)
        return res
          .status(500)
          .json({ title: "Settings error", description: `You must have specific channels to use AI for ${server.name}`, code: 11 });
      else if (settings.giveaway.trim().match(channelsRegex) && !req.user.roles.includes("961160473213018142"))
        return res
          .status(500)
          .json({ title: "Settings error", description: `Auto giveaway entring is reserved for Holder+ users in ${server.name}`, code: 27 });
      else if (settings.useAI && settings.percentResponse > 15)
        return res
          .status(500)
          .json({ title: "Settings error", description: `Percent response must be range (0,15] when using AI for ${server.name}`, code: 12 });
      else if (settings.spamChannel.length == 18 && (settings.responseTime < 5 || settings.responseTime > 120))
        return res.status(500).json({ title: "Settings Error", description: `Spam Channel is set but typing time is out of range`, code: 8 });
      else if (settings.percentResponse <= 0 || settings.percentResponse > 100)
        return res
          .status(500)
          .json({ title: "Settings error", description: `Percent response provided is out of range for ${server.name}`, code: 6 });
      else if (channels.length > 0 && !channels.trim().match(channelsRegex))
        return res.status(500).json({ title: "Settings error", description: `Specific Channels don't pass the regex for ${server.name}`, code: 9 });
      else if (settings.blacklist.length > 0 && !settings.blacklist.trim().match(channelsRegex))
        return res.status(500).json({ title: "Settings error", description: `Blacklist users list ins't valid for ${server.name}`, code: 24 });
      else if (settings.whitelist.length > 0 && !settings.whitelist.trim().match(channelsRegex))
        return res.status(500).json({ title: "Settings error", description: `Whitelist users list ins't valid for ${server.name}`, code: 27 });
    }

    if (!token || token == "N/A")
      return res.status(500).json({ title: "Token Error", description: "Token provided is either invalid or not found", code: 1 });
    else if (servers.length > 10 || servers.length <= 0)
      return res.status(500).json({ title: "Servers Error", description: `Total server count out of range [0-10]`, code: 5 });
    else if (!token.trim().match(tokenRegex)) res.status(500).json({ title: "Token Error", description: `Token failed regex requirement`, code: 5 });
    else if (trackingcount <= 0 || trackingcount > 5)
      return res.status(500).json({ title: "Servers Error", description: `Tracking servers count out of range [1 - 5]`, code: 7 });
    else if (!webhookRegex.test(body.webhook)) res.status(500).json({ title: "Webhook Error", description: `Webhook doesn't pass regex`, code: 19 });
    else if ((holderStatus == "Holder" || holderStatus == "Not Holder") && aiuses > 2)
      return res
        .status(500)
        .json({ title: "Servers Error", description: `You reached your max AI servers of 2, the rest can be spam or filter based`, code: 23 });
    else if (holderStatus == "Holder+" && aiuses > 4)
      return res
        .status(500)
        .json({ title: "Servers Error", description: `You reached your max AI servers of 4, the rest can be spam or filter based`, code: 23 });

    if (!res.headersSent) next();
  } catch (error) {
    console.log("middleware error caught in trackcheck");
    return res.status(500).json({ title: "Settings error", description: `Failure to check settings, try again or adjust settings` });
  }
};

export interface InviteRequest {
  amount: number;
  captcha: number;
  channelID: string;
  concurrent: boolean;
  delay: number;
  guildID: string;
  inviteLink: string;
  messageID: string;
  message: string;
  reaction: string;
  webhook: string;
  guildName: string;
  serverLogo: string;
  verbose: boolean;
}
export const checkInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params: InviteRequest = req.body;
    const keys = Object.keys(params);
    if (!keys.includes("amount")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("captcha")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("channelID")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("delay")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("guildID")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("inviteLink")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("messageID")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("message")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("reaction")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("webhook")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("guildName")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("serverLogo")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("concurrent")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });
    if (!keys.includes("verbose")) return res.status(500).json({ title: "Invite error", description: `Object property is missing` });

    params.channelID = params.channelID.trim();
    params.guildID = params.guildID.trim();
    params.messageID = params.messageID.trim();
    params.reaction = params.reaction.trim();
    params.message = params.message.trim();
    params.inviteLink = params.inviteLink.trim();
    params.webhook = params.webhook.trim();
    params.serverLogo = params.serverLogo.trim();
    req.body.amount = parseInt(req.body.amount);

    if (params.amount <= 0 || params.amount >= 16)
      return res.status(500).json({ title: "Invite error", description: `Amount is out of range [1,15]` });
    if (!params.webhook.match(webhookRegex)) return res.status(500).json({ title: "Invite error", description: `Webhook is not valid` });
    if (params.delay <= 1 || params.delay >= 120)
      return res.status(500).json({ title: "Invite error", description: `Delay is out of range [2,120]` });
    if (params.guildID.length != 18) return res.status(500).json({ title: "Invite error", description: `Invite link is not set` });
    if (!invRegex.test(params.inviteLink)) return res.status(500).json({ title: "Invite error", description: `Invite link is not valid` });
    if (params.captcha < 0 || params.captcha >= 4)
      return res.status(500).json({ title: "Invite error", description: `Captcha is out of range [0,3]` });
    if (params.reaction.length >= 1 && !params.reaction.match(emojiRegex))
      return res.status(500).json({ title: "Invite error", description: `Reaction emoji is invalid` });
    if (params.reaction.match(emojiRegex) && (!params.messageID.match(channelRegex) || !params.channelID.match(channelRegex)))
      return res.status(500).json({ title: "Invite error", description: `Reaction is present but messageID or channelID are not valid` });
    if (params.reaction.match(emojiRegex) && (!params.messageID.match(channelRegex) || !params.channelID.match(channelRegex)))
      return res.status(500).json({ title: "Invite error", description: `Reaction is present but messageID or channelID are not valid` });
    if (params.message.length >= 1 && !params.channelID.match(channelRegex))
      return res.status(500).json({ title: "Invite error", description: `Message to send is present but channelID is not valid` });
    next();
  } catch (error) {
    console.log("middleware error caught");
    return res.status(500).json({ title: "Invite error", description: `Failure to check parameters, try again or fix settings` });
  }
};

export const checkUses = async (req: any, res: Response, next: NextFunction) => {
  const userid = req.jwt.userid;
  const uses = await getUses(userid);
  if (uses) {
    if (uses + parseInt(req.body.amount) > 50) {
      const reset = await checkNextReset(userid);
      if (Date.now() >= reset) {
        await setNextReset(userid, Date.now() + 86_400_00, 0);
        return next();
      }

      return res.status(500).json({ title: "Invite Error", description: "Such request would bring the uses count over maximum invitations of 50" });
    }
  }
  next();
};

export const testWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const { data } = await axios
    .get<WebhookData>("https://discord.com/api/webhooks/962882014640504892/IO59x6FeCMwsV9zPsLr9rkVm4XOTCGGp-qurD6f0dfrZREAgfEfXNlCiOdQda9o5zPZ8")
    .catch((err: AxiosError<GeneralDiscordError>) => {
      if (axios.isAxiosError(err) && err.response) {
        console.log("webhook error:", err.response.data);
        return { data: err.response.data };
      } else {
        console.log("unexpected error: ", err.response?.data);
        throw new Error("An unexpected error occurred");
      }
    });
  console.log(data);

  if ("code" in data) {
    return res.status(404).json({ title: "Webhook Error", description: "Something went wrong when checking the webhook" });
  }
  next();
};

export interface WebhookData {
  type: number;
  id: string;
  name: string;
  avatar: string;
  channel_id: string;
  guild_id: string;
  application_id: null;
  token: string;
}
