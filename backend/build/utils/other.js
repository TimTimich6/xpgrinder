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
exports.howManyHolding = exports.generateAIResponse = void 0;
const openai_1 = require("openai");
const configuration = new openai_1.Configuration({
    apiKey: "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",
});
const openai = new openai_1.OpenAIApi(configuration);
const generateAIResponse = (message, temperature) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = `${message} ->`;
    const response = yield openai
        .createCompletionFromModel({
        prompt,
        model: "ada:ft-personal-2022-04-25-07-48-38",
        temperature: temperature / 100,
        max_tokens: 25,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stop: ["\n", "\n\n"],
        stream: false,
        best_of: 1,
    })
        .catch((err) => err.response.data);
    if (response.data.choices)
        return response.data.choices[0].text.trim();
});
exports.generateAIResponse = generateAIResponse;
function howManyHolding(roles) {
    if (roles.includes("961160178860970004"))
        return "Miniwhale";
    if (roles.includes("961160605748830230"))
        return "Holder++";
    if (roles.includes("961160473213018142"))
        return "Holder+";
    if (roles.includes("961160369060065300"))
        return "Holder";
    else
        return "Not Holder";
}
exports.howManyHolding = howManyHolding;
