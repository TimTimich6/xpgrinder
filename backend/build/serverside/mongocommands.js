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
exports.updateAccess = exports.getByUserid = exports.createUser = exports.getUses = exports.updateTokens = exports.addUses = exports.uploadExample = exports.updateWebhookAndToken = exports.overwriteServers = void 0;
const mongodb_1 = require("mongodb");
const waitTime_1 = __importDefault(require("../utils/waitTime"));
const fs_1 = __importDefault(require("fs"));
const uri = "mongodb+srv://tim:tallkitten47@cluster0.k1aaw.mongodb.net/xpgrinder?retryWrites=true&w=majority";
const client = new mongodb_1.MongoClient(uri);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect().catch((err) => {
        console.error(err);
    });
}))();
const overwriteServers = (userid, servers, active) => __awaiter(void 0, void 0, void 0, function* () {
    yield client
        .db("xpgrinder")
        .collection("users")
        .updateOne({ userid }, { $set: { servers: servers, active } });
});
exports.overwriteServers = overwriteServers;
const updateWebhookAndToken = (userid, webhook, token) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.db("xpgrinder").collection("users").updateOne({ userid }, { $set: { webhook, token } });
});
exports.updateWebhookAndToken = updateWebhookAndToken;
const uploadExample = (userid, example) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.db("xpgrinder").collection("examples").insertOne({ userid, prompt: example.prompt, completion: example.completion });
});
exports.uploadExample = uploadExample;
const addUses = (userid, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof amount == "string")
        amount = parseInt(amount);
    const result = yield client
        .db("xpgrinder")
        .collection("users")
        .updateOne({ userid }, { $inc: { uses: amount } });
    console.log("updated uses for userid", userid, "with", amount);
});
exports.addUses = addUses;
const updateTokens = (tokendata, userid) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client
        .db("xpgrinder")
        .collection("users")
        .updateOne({ userid: userid }, { $set: { access_token: tokendata.access_token, refresh_token: tokendata.refresh_token } }, { upsert: true });
});
exports.updateTokens = updateTokens;
const getUses = (userid) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client
        .db("xpgrinder")
        .collection("users")
        .findOne({ userid }, { projection: { uses: 1 } });
    if (result)
        return result.uses;
    return null;
});
exports.getUses = getUses;
// getUses("hello").then(console.log);
function getAllExamples() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, waitTime_1.default)(3);
        client
            .db("xpgrinder")
            .collection("examples")
            .find({}, { projection: { _id: 0, userid: 0 } })
            .toArray((err, result) => {
            if (err)
                throw err;
            client.close();
            const StringJson = JSON.stringify(result);
            fs_1.default.writeFileSync("examples.json", StringJson);
        });
    });
}
const createUser = (userid, username, accesstoken, refreshtoken, hash, roles) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client
        .db("xpgrinder")
        .collection("users")
        .insertOne({ userid, username, accesstoken, refreshtoken, servers: [], uses: 0, token: "", webhook: "", hash: hash || "", roles, active: false });
    return result;
});
exports.createUser = createUser;
const getByUserid = (userid) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client.db("xpgrinder").collection("users").findOne({ userid });
    return result;
});
exports.getByUserid = getByUserid;
const updateAccess = (userid, accesstoken, refrereshtoken, roles) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client.db("xpgrinder").collection("users").updateOne({ userid }, { $set: { refrereshtoken, accesstoken, roles } });
    return result;
});
exports.updateAccess = updateAccess;
// getAllExamples();
