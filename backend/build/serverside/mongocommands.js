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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadExample = exports.overwriteServers = exports.clearTracking = exports.replaceKey = exports.getUser = void 0;
const mongodb_1 = require("mongodb");
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
