import { url } from "inspector";
import { Configuration, OpenAIApi } from "openai";
import { emojiRegex } from "../serverside/middleware";

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
export const generateAIResponse = async (message: string): Promise<string | undefined> => {
  const prompt = `${message} ->`;
  const response = await openai
    .createCompletionFromModel({
      prompt,
      model: "ada:ft-personal-2022-04-14-02-38-57",
      temperature: 0.6,
      max_tokens: 30,
      top_p: 0.7,
      frequency_penalty: 0.3,
      presence_penalty: 0.27,
      stop: ["\n", "\n\n"],
      stream: false,
      best_of: 1,
    })
    .catch((err) => err.response.data);

  if (response.data.choices) return response.data.choices[0].text.trim();
};
