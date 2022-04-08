import { KeyData } from "./mongocommands";
import { NextFunction, Request, Response } from "express";
import PasteClient from "pastebin-api";

export const getPaste = async (id: string) => {
  const client = new PasteClient("JREh35B5lwRes-iUQrrWp8Hr7wv4Y2LC");
  const token = await client.login("Timtimich", "mintmachines");
  const data = await client.getRawPasteByKey({
    pasteKey: id,
    userKey: token,
  });
  return data;
};
export const checkTracking = (req: Request, res: Response, next: NextFunction) => {
  const body: KeyData = req.body;
  const { token, servers } = body;
  let trackingcount = 0;
  const channelsRegex = /^\d{18}(?:\s+\d{18})*$/g;
  servers.forEach((server) => {
    const { filters, settings } = server;
    const channels = settings.channels.trim();

    if (server.tracking) trackingcount++;
    if (filters.some((filter) => !filter.filter || !filter.response)) {
      res.status(500).json({ title: "Filter error", description: `Filters provided are either empty of invalid for ${server.name}`, code: 2 });
      return;
    } else if (settings.percentResponse <= 0 || settings.percentResponse > 100) {
      res.status(500).json({ title: "Settings error", description: `Response time  ${server.name}`, code: 13 });
      return;
    } else if (settings.useAI == false && filters.length == 0 && settings.spamChannel.length != 18) {
      res.status(500).json({ title: "Filter error", description: `No filters provided to work for ${server.name}`, code: 3 });
      return;
    } else if (settings.spamChannel.length > 0 && !settings.spamChannel.match(channelsRegex)) {
      res.status(500).json({ title: "Settings error", description: `Spam Channel regex didn't pass for ${server.name}`, code: 10 });
      return;
    } else if (settings.spamChannel.match(channelsRegex) && (settings.responseTime <= 0 || settings.responseTime >= 120)) {
      res.status(500).json({ title: "Settings error", description: `Response time provided is out of range for ${server.name}`, code: 4 });
      return;
    } else if (!settings.channels.match(channelsRegex) && settings.useAI) {
      res.status(500).json({ title: "Settings error", description: `You must have specific channels to use AI for ${server.name}`, code: 11 });
      return;
    } else if (settings.useAI && settings.percentResponse > 15) {
      res
        .status(500)
        .json({ title: "Settings error", description: `Percent response must be range (0,15] when using AI for ${server.name}`, code: 12 });
      return;
    } else if (settings.spamChannel.length == 18 && (settings.responseTime < 5 || settings.responseTime > 120)) {
      res.status(500).json({ title: "Settings Error", description: `Spam Channel is set but typing time is out of range`, code: 8 });
    } else if (settings.percentResponse <= 0 || settings.percentResponse > 100) {
      res.status(500).json({ title: "Settings error", description: `Percent response provided is out of range for ${server.name}`, code: 6 });
      return;
    } else if (channels.length > 0 && !channels.match(channelsRegex)) {
      res.status(500).json({ title: "Settings error", description: `Specific Channels don't pass the regex for ${server.name}`, code: 9 });
      return;
    }
  });

  if (!token || token == "N/A")
    res.status(500).json({ title: "No token found", description: "Token provided is either invalid or not found", code: 1 });
  else if (servers.length > 2 || servers.length <= 0)
    res.status(500).json({ title: "Servers Error", description: `Total server count out of max range [0-2]`, code: 5 });
  else if (trackingcount <= 0 || trackingcount > 2)
    res.status(500).json({ title: "Servers Error", description: `Tracking servers count out of max range [1 - 2]`, code: 7 });

  if (!res.headersSent) next();
};

export const authKey = async (req: Request, res: Response, next: NextFunction) => {
  const key: string = <string>req.headers["testing-key"];
  const data = await getPaste("WHBfhqt7").catch((err) => {
    res.status(500).json({ title: "Server Error", description: "Internal server error occured when getting keys" });
    return null;
  });
  if (data) {
    const splitTokens: string[] = data.split("\r\n");
    if (key && splitTokens.includes(key)) {
      console.log("key found: ", key);
      next();
    } else {
      console.log("key not found:", key);
      res.status(404).json({ title: "Key not found", description: "Enter a valid key to use the XP Grinder" });
    }
  }
};
