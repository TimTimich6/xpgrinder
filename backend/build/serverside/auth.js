"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "whitelistaiosecret";
function generateAccessToken(username) {
    return jsonwebtoken_1.default.sign(username, secret, { expiresIn: "1800s" });
}
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, secret, (err, user) => {
        console.log(err);
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
