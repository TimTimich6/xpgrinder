import { getByUserid } from "./mongocommands";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export const secret = "whitelistaiosecret";

export const isAuthed = (req: Request | any, res: Response, next: Function) => {
  const cookie = req.headers.cookie;
  try {
    if (cookie) {
      const token = cookie.split("jwt=")[1];
      const verf = jwt.verify(token, secret);
      console.log("verf: ", verf);
      req.jwt = verf;
      next();
    } else throw new Error();
  } catch (error) {
    console.log("failed to auth");
    res.status(400).json({ title: "JWT Error", description: "Invalid JWT token" });
  }
};

export const hasRole = async (req: any, res: Response, next: Function) => {
  try {
    if (req.jwt) {
      const result = await getByUserid(req.jwt.userid);
      if (result) {
        if (result.roles.includes("961160369060065300")) {
          req.user = result;
          next();
        } else return res.status(400).json({ title: "Role error", description: "Doesn't have Holder role id 943411970965663754" });
      }
    }
  } catch (error) {
    res.status(400).json({ title: "JWT Error", description: "Resign in with discord" });
  }
};
