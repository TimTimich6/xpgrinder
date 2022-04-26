import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = "whitelistaiosecret";
function generateAccessToken(username: string) {
  return jwt.sign(username, secret, { expiresIn: "1800s" });
}

export const isAuthenthorized = (req: any, res: Response, next: Function) => {
  if (req.user) {
    console.log("user is logged in");
    console.log(req.user);
    next();
  } else {
    console.log("user is not logged in");
    res.redirect("/api/auth");
  }
};
