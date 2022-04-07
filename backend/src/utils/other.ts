import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);
let prompt = `The following is a conversation with a random person. Both Person1 and Person2 are friendly, humorous, and helpful. Person1 and Person2 are talking about an NFT project that they both are interested in buying. They also love the Solana cryptocurrency. They are anticipating this NFT project and can't wait for it. The project is at a fair price and the utility is good.\n\n
Person1: Hello, who are you?\nPerson2: I'm great, how about you?\nPerson1: I'm good, thanks. I love this project!\nPerson2: Me too, I love the developers.\nPerson1: They will be minting their NFT project soon, I'm very excited, the demo looks great.\nPerson2: Yes, I can't wait to get my hands on some of those NFTs.\n`;
export const generateAIResponse = async (message: string): Promise<string | undefined> => {
  prompt += `Person1: ${message}\n`;
  const response = await openai
    .createCompletion("text-davinci-002", {
      prompt,
      temperature: 1,
      max_tokens: 30,
      top_p: 0.25,
      frequency_penalty: 0.3,
      presence_penalty: 0.27,
      stop: ["\n", "\n\n"],
      stream: false,
      best_of: 1,
    })
    .catch((err) => err.response.data);
  // console.log(response.data);
  if (response.data && response.data.choices) return response.data.choices[0].text!.trim().substring(9);
};

// generateAIResponse("When is mint happening?");
