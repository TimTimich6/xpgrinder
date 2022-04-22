import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const secret = "whitelistaiosecret";
function generateAccessToken(username: string) {
  return jwt.sign(username, secret, { expiresIn: "1800s" });
}

const authenticateToken = (req: any, res: Response, next: Function) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, secret, (err: any, user: any) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user! = user;
    next();
  });
};
