import { NextFunction, Request, Response } from "express";
import { TrackBody } from "./server";

export const checkTracking = (req: Request, res: Response, next: NextFunction) => {
  const body: TrackBody = req.body;
  const { filters, token, settings } = body;
  if (!token) res.json({ error: 1 });
  else if (filters.some((filter) => !filter.filter || !filter.response)) res.json({ error: 2 });
  else if (filters.length == 0 && !settings.useAI) res.json({ error: 3 });
  else next();
};
