import { NextFunction, Request, Response } from "express";
import { TrackBody } from "./server";
import PasteClient from "pastebin-api";
const client = new PasteClient("JREh35B5lwRes-iUQrrWp8Hr7wv4Y2LC");

const getPaste = async () => {
  const token = await client.login("Timtimich", "mintmachines");
  const data = await client.getRawPasteByKey({
    pasteKey: "WHBfhqt7",
    userKey: token,
  });
  return data;
};
export const checkTracking = (req: Request, res: Response, next: NextFunction) => {
  const body: TrackBody = req.body;
  const { filters, token, settings } = body;
  if (!token) res.status(500).json({ title: "No token found", description: "Token provided is either invalid or not found", code: 1 });
  else if (filters.some((filter) => !filter.filter || !filter.response))
    res.status(500).json({ title: "Filter error", description: "Filters provided are either empty of invalid", code: 2 });
  else if (filters.length == 0 && !settings.useAI)
    res.status(500).json({ title: "Filter error", description: "No filters provided to work with", code: 3 });
  else if (settings.responseTime <= 0 || settings.responseTime >= 15)
    res.status(500).json({ title: "Settings error", description: "Response time provided is out of range", code: 4 });
  else next();
};

export const authKey = async (req: Request, res: Response, next: NextFunction) => {
  const key: string = <string>req.headers["testing-key"];
  const data = await getPaste();
  const splitTokens: string[] = data.split("\r\n");
  if (key && splitTokens.includes(key)) {
    console.log("key found: ", key);
    next();
  } else {
    console.log("key not found:", key);
    res.status(404).json({ title: "Key not found", description: "Enter a valid key to use the XP Grinder" });
  }
};
