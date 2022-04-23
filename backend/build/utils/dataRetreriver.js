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
exports.generateUnique = exports.getRandomTokens = exports.getPaste = exports.readBin = void 0;
const jsonbin_io_api_1 = require("jsonbin-io-api");
const api = new jsonbin_io_api_1.JsonBinIoApi("$2b$10$/HwW4Ggy8nlHZxSKQJamg.sVgmXbl/cqqYmNNgxBm57g9guxK5Jge");
const pastebin_api_1 = __importDefault(require("pastebin-api"));
const client = new pastebin_api_1.default("JREh35B5lwRes-iUQrrWp8Hr7wv4Y2LC");
const readBin = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield api.bins.read({
        binId: id,
    });
    return data.record;
});
exports.readBin = readBin;
const getPaste = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield client.login("Timtimich", "mintmachines");
    const data = yield client.getRawPasteByKey({
        pasteKey: id,
        userKey: token,
    });
    return data;
});
exports.getPaste = getPaste;
const getRandomTokens = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = yield (0, exports.getPaste)("8w4wsCGR").catch((err) => {
        console.log("failure to get tokens paste");
        return null;
    });
    if (tokens) {
        const splitTokens = tokens.split("\r\n");
        // const nonDuplicates = splitTokens.filter((token) => !tokens.includes(token));
        // console.log(splitTokens);
        const unique = generateUnique(splitTokens, 1);
        return unique;
    }
    return [];
});
exports.getRandomTokens = getRandomTokens;
function generateUnique(arr, amount) {
    const uniqueArray = [];
    while (uniqueArray.length < amount) {
        const genedElement = arr[Math.floor(Math.random() * arr.length)];
        if (!uniqueArray.includes(genedElement)) {
            uniqueArray.push(genedElement);
        }
    }
    return uniqueArray;
}
exports.generateUnique = generateUnique;
const test = () => {
    const paste = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    const tokens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const nonDuplicates = paste.filter((token) => !tokens.includes(token));
    const sample = generateUnique(nonDuplicates, 5);
    return sample;
};
// test();
