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
exports.getUses = exports.addUses = exports.uploadExample = exports.overwriteServers = exports.clearTracking = exports.replaceKey = exports.getUser = void 0;
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
const getUser = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const query = yield client.db("xpgrinder").collection("keys").findOne({ key: key });
    return query;
});
exports.getUser = getUser;
const replaceKey = (user) => __awaiter(void 0, void 0, void 0, function* () {
    yield client
        .db("xpgrinder")
        .collection("keys")
        .updateOne({ key: user.key }, { $set: Object.assign({}, user) }, { upsert: true });
});
exports.replaceKey = replaceKey;
const clearTracking = (key, servers) => __awaiter(void 0, void 0, void 0, function* () {
    yield client
        .db("xpgrinder")
        .collection("keys")
        .updateOne({ key: key }, { $set: { servers: servers, active: false } }, { upsert: true });
});
exports.clearTracking = clearTracking;
const overwriteServers = (key, servers) => __awaiter(void 0, void 0, void 0, function* () {
    yield client
        .db("xpgrinder")
        .collection("keys")
        .updateOne({ key: key }, { $set: { servers: servers } }, { upsert: true });
});
exports.overwriteServers = overwriteServers;
const uploadExample = (key, example) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.db("xpgrinder").collection("examples").insertOne({ key: key, prompt: example.prompt, completion: example.completion });
});
exports.uploadExample = uploadExample;
const addUses = (key, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client
        .db("xpgrinder")
        .collection("keys")
        .updateOne({ key: key }, { $inc: { uses: amount } }, { upsert: true });
    console.log("updated uses for key", key, "with", amount);
});
exports.addUses = addUses;
const getUses = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client
        .db("xpgrinder")
        .collection("keys")
        .findOne({ key: key }, { projection: { uses: 1 } });
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
            .find({}, { projection: { _id: 0, key: 0 } })
            .toArray((err, result) => {
            if (err)
                throw err;
            client.close();
            const StringJson = JSON.stringify(result);
            fs_1.default.writeFileSync("examples.json", StringJson);
        });
    });
}
// getAllExamples();
