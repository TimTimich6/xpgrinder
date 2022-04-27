"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenthorized = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = "whitelistaiosecret";
function generateAccessToken(username) {
    return jsonwebtoken_1.default.sign(username, secret, { expiresIn: "1800s" });
}
const isAuthenthorized = (req, res, next) => {
    if (req.user) {
        console.log("user is logged in");
        console.log(req.user);
        next();
    }
    else {
        console.log("user is not logged in");
        res.redirect("/api/auth");
    }
};
exports.isAuthenthorized = isAuthenthorized;
