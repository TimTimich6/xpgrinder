"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.invite = void 0;
const axios_1 = __importDefault(require("axios"));
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const headers_1 = __importStar(require("./headers"));
const clientKey = "898dc14ab0768f8250193ed2d4af4666";
const TwoCapKey = "d3bcb4eeed1069b8dccb8219f9b0ab7e";
const invite = (link, token, maxCaptchas, webhook, agent, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!link.includes("https://discord"))
        throw new Error("Not a valid url");
    const code = link.substring(link.lastIndexOf("/") + 1);
    const { data } = yield axios_1.default
        .post(`https://discord.com/api/v9/invites/${code}`, payload || {}, {
        headers: Object.assign(Object.assign({}, headers_1.default), { authorization: token, Cookie: yield (0, headers_1.getCookie)() }),
        httpsAgent: agent,
        timeout: 15000,
    })
        .catch((err) => {
        var _a, _b;
        if (axios_1.default.isAxiosError(err) && ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) == 400) {
            return { data: err.response.data, headers: err.response.headers, status: err.response.status };
        }
        else if (axios_1.default.isAxiosError(err) && ((_b = err.response) === null || _b === void 0 ? void 0 : _b.status) == 403) {
            console.log(err.response.data);
            return { data: err.response.data, headers: err.response.headers, status: err.response.status };
        }
        else {
            console.log("unexpected error in invite: ", err);
            throw new Error("An unexpected error occurred");
        }
    });
    if ("guild" in data) {
        console.log("success in joining");
        if (data.show_verification_form == true) {
            const bypassed = yield bypassTos(data.guild.id, code, token);
            if (bypassed)
                return 1;
            return 2;
        }
        return 1;
    }
    else if ("captcha_key" in data) {
        console.log("captcha left", maxCaptchas);
        if (maxCaptchas == 0) {
            console.log("Captcha max reached");
            return 0;
        }
        console.log("Captcha Key:", data.captcha_key);
        const solution = yield solveCaptchaAnti(data);
        if (typeof solution == "number") {
            if (webhook.params.verbose)
                yield webhook.sendCaptcha(data, "Failed to solve");
            const resp = yield (0, exports.invite)(link, token, maxCaptchas - 1, webhook, agent);
            return resp;
        }
        else if (typeof solution == "string") {
            if (webhook.params.verbose)
                yield webhook.sendCaptcha(data, solution.slice(-10));
            console.log("solution", solution.slice(-5));
            const resp = yield (0, exports.invite)(link, token, maxCaptchas - 1, webhook, agent, { captcha_key: solution, captcha_rqtoken: data.captcha_rqtoken });
            return resp;
        }
        else {
            console.log("Unable to solve captcha", solution);
            return -2;
        }
    }
    else if ("code" in data)
        return -1;
    else {
        console.log("end reached, returning 0");
        return 0;
    }
});
exports.invite = invite;
// invite("https://discord.gg/rczPSNdT", "OTU2NjQzNTI5MzQwMzc1MDUx.YjzOHQ.VQabvD4wnPiArNKveNEwmUrP5wQ", 4);
// bypassTos("948389739671744572", "bearwithus", "OTQxMzAxMzI3MDU1NzEyMzE2.YgT9Nw.DekzbPK8r8WsOSodngpCzE8aEQY");
function solveCaptchaAnti(captcha) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            clientKey,
            languagePool: "en",
            task: {
                type: "HCaptchaTaskProxyless",
                websiteURL: "https://discord.com",
                websiteKey: captcha.captcha_sitekey,
                isInvisible: false,
                userAgent: headers_1.userAgent,
                enterprisePayload: {
                    rqdata: captcha.captcha_rqdata,
                    sentry: false,
                },
            },
        };
        const { data } = yield axios_1.default
            .post("https://api.anti-captcha.com/createTask", payload, {
            headers: { "content-type": "application/json" },
            timeout: 15000,
        })
            .catch((err) => {
            var _a;
            if (axios_1.default.isAxiosError(err) && err.response) {
                console.log("task error:", err.response.data);
                return { data: err.response.data };
            }
            else {
                console.log("unexpected error: ", (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
                throw new Error("An unexpected error occurred");
            }
        });
        if ("taskId" in data) {
            yield (0, waitTime_1.default)(20);
            for (let index = 0; index < 4; index++) {
                const taskGetData = yield axios_1.default
                    .post("https://api.anti-captcha.com/getTaskResult", { clientKey, taskId: data.taskId }, { headers: { "content-type": "application/json" }, timeout: 15000 })
                    .then((resp) => resp.data)
                    .catch((err) => {
                    console.log("anti captcha error or not ready");
                    console.log(err);
                    return -2;
                });
                if (typeof taskGetData != "number" && "solution" in taskGetData) {
                    return taskGetData.solution.gRecaptchaResponse;
                }
                yield (0, waitTime_1.default)(5);
            }
            return -2;
        }
        console.log("failed data", data);
        return -2;
    });
}
function solveCaptcha2Captcha(captcha) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            key: TwoCapKey,
            method: "hcaptcha",
            json: 1,
            sitekey: captcha.captcha_sitekey,
            data: captcha.captcha_rqdata,
            userAgent: headers_1.userAgent,
            pageurl: "https://discord.com/",
        };
        const url = `http://2captcha.com/in.php?key=${payload.key}&method=hcaptcha&sitekey=${payload.sitekey}&pageurl=${payload.pageurl}}&data=${payload.data}&json=1&useragent=${payload.userAgent}`;
        const resp = yield axios_1.default
            .post(url, payload, {
            headers: { "content-type": "application/json" },
            timeout: 15000,
        })
            .catch((err) => {
            var _a;
            if (axios_1.default.isAxiosError(err) && err.response) {
                console.log("task error:", err.response.data);
            }
            else {
                console.log("unexpected error: ", (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
            }
            return -2;
        });
        if (typeof resp != "number" && resp.data.status == 1) {
            for (let index = 0; index < 4; index++) {
                yield (0, waitTime_1.default)(20);
                const taskGetData = yield axios_1.default
                    .get(`http://2captcha.com/res.php?key=${TwoCapKey}&action=get2&id=${resp.data.request}&json=1`, {
                    timeout: 15000,
                })
                    .then((resp) => resp.data)
                    .catch((err) => {
                    var _a;
                    if (axios_1.default.isAxiosError(err) && err.response) {
                        console.log("get task 2cap error", err.response.data);
                        return null;
                    }
                    else {
                        console.log("unexpected error: ", (_a = err.response) === null || _a === void 0 ? void 0 : _a.data);
                        throw new Error("An unexpected error occurred");
                    }
                });
                if ((taskGetData === null || taskGetData === void 0 ? void 0 : taskGetData.status) == 1) {
                    // console.log("successful solution 2cap", taskGetData);
                    return taskGetData.request;
                }
                else if (taskGetData === null || taskGetData === void 0 ? void 0 : taskGetData.request.includes("ERROR")) {
                    console.log("captcha error, most likely unsolvable");
                    return -2;
                }
                else
                    console.log(taskGetData);
            }
            return -2;
        }
        console.log("failed data", typeof resp != "number" ? resp.data : resp);
        return -2;
    });
}
function bypassTos(guildID, code, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield axios_1.default
            .get(`https://discord.com/api/v9/guilds/${guildID}/member-verification?with_guild=false&invite_code=${code}`, {
            headers: Object.assign(Object.assign({}, headers_1.default), { authorization: token }),
            timeout: 15000,
        })
            .catch((err) => {
            var _a, _b, _c;
            if (axios_1.default.isAxiosError(err) && ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) == 400) {
                return { data: err.response.data, headers: err.response.headers, status: err.response.status };
            }
            else if (axios_1.default.isAxiosError(err) && ((_b = err.response) === null || _b === void 0 ? void 0 : _b.status) == 403) {
                console.log(err.response.data);
                return { data: err.response.data, headers: err.response.headers, status: err.response.status };
            }
            else {
                console.log("unexpected error: ", (_c = err.response) === null || _c === void 0 ? void 0 : _c.data);
                throw new Error("An unexpected error occurred");
            }
        });
        if ("form_fields" in data) {
            const acceptedForms = data.form_fields.map((form) => {
                return Object.assign(Object.assign({}, form), { response: true });
            });
            const payload = { version: data.version, form_fields: acceptedForms };
            const screeningDone = yield axios_1.default
                .put(`https://discord.com/api/v9/guilds/${guildID}/requests/@me`, payload, {
                headers: Object.assign(Object.assign({}, headers_1.default), { authorization: token }),
                timeout: 15000,
            })
                .then((res) => res.data);
            if (screeningDone.application_status == "APPROVED") {
                console.log("successfully bypassed");
                return true;
            }
        }
        console.log("failure to bypass");
        return false;
    });
}
