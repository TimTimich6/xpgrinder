import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
export const generateAIResponse = async (message: string, temperature: number): Promise<string | undefined> => {
  const prompt = `${message} ->`;
  const response = await openai
    .createCompletionFromModel({
      prompt,
      model: "ada:ft-personal-2022-05-11-04-09-12",
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

  if (response.data.choices) return response.data.choices[0].text.trim();
};

export function howManyHolding(roles: string[]): string {
  if (roles.includes("961160058882883604")) return "Whale";
  if (roles.includes("961160178860970004")) return "Miniwhale";
  if (roles.includes("961160605748830230")) return "Holder++";
  if (roles.includes("961160473213018142")) return "Holder+";
  if (roles.includes("961160369060065300")) return "Holder";
  else return "Not Holder";
}
