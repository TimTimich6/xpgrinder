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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.isAuthed = exports.secret = void 0;
const mongocommands_1 = require("./mongocommands");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.secret = "whitelistaiosecret";
const isAuthed = (req, res, next) => {
    const cookie = req.headers.cookie;
    try {
        if (cookie) {
            const token = cookie.split("jwt=")[1];
            const verf = jsonwebtoken_1.default.verify(token, exports.secret);
            console.log("verf: ", verf);
            req.jwt = verf;
            next();
        }
        else
            throw new Error();
    }
    catch (error) {
        console.log("failed to auth");
        res.status(400).json({ title: "JWT Error", description: "Invalid JWT token" });
    }
};
exports.isAuthed = isAuthed;
const hasRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.jwt) {
            const result = yield (0, mongocommands_1.getByUserid)(req.jwt.userid);
            if (result) {
                if (result.roles.includes("961160369060065300")) {
                    req.user = result;
                    next();
                }
                else
                    res.status(400).json({ title: "Role error", description: "Doesn't have Holder role id 943411970965663754" });
            }
        }
    }
    catch (error) {
        res.status(400).json({ title: "JWT Error", description: "JWT token not found" });
    }
});
exports.hasRole = hasRole;
