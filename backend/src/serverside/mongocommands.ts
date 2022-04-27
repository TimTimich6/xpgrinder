import { Server } from "./../discordapiutils/websocket";
import { Document, FindCursor, MongoClient, UpdateResult, WithId } from "mongodb";
import { DiscordAccessToken, Example } from "./server";
import waitTime from "../utils/waitTime";
import fs from "fs";
export interface KeyData {
  key: string;
  token: string;
  servers: Server[];
  webhook: string;
}
const uri: string = "mongodb+srv://tim:tallkitten47@cluster0.k1aaw.mongodb.net/xpgrinder?retryWrites=true&w=majority";
const client = new MongoClient(uri);
(async () => {
  await client.connect().catch((err) => {
    console.error(err);
  });
})();

export const getUser = async (key: string): Promise<WithId<Document> | null> => {
  const query = await client.db("xpgrinder").collection("keys").findOne({ key: key });
  return query;
};

export const replaceKey = async (user: KeyData): Promise<void> => {
  await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ key: user.key }, { $set: { ...user } }, { upsert: true });
};

export const clearTracking = async (key: string, servers: Server[]): Promise<void> => {
  await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ key: key }, { $set: { servers: servers, active: false } }, { upsert: true });
};

export const overwriteServers = async (key: string, servers: Server[]): Promise<void> => {
  await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ key: key }, { $set: { servers: servers } }, { upsert: true });
};

export const uploadExample = async (key: string, example: Example): Promise<void> => {
  await client.db("xpgrinder").collection("examples").insertOne({ key: key, prompt: example.prompt, completion: example.completion });
};

export const addUses = async (key: string, amount: number | string): Promise<void> => {
  if (typeof amount == "string") amount = parseInt(amount);
  const result = await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ key: key }, { $inc: { uses: amount } }, { upsert: true });
  console.log("updated uses for key", key, "with", amount);
};

export const updateTokens = async (tokendata: DiscordAccessToken, userid: string): Promise<void> => {
  const result = await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ userid: userid }, { $set: { access_token: tokendata.access_token, refresh_token: tokendata.refresh_token } }, { upsert: true });
};
export const getUses = async (key: string): Promise<number | null> => {
  const result = await client
    .db("xpgrinder")
    .collection("keys")
    .findOne({ key: key }, { projection: { uses: 1 } });
  if (result) return result.uses;
  return null;
};
// getUses("hello").then(console.log);
async function getAllExamples() {
  await waitTime(3);
  client
    .db("xpgrinder")
    .collection("examples")
    .find({}, { projection: { _id: 0, key: 0 } })
    .toArray((err, result) => {
      if (err) throw err;
      client.close();
      const StringJson = JSON.stringify(result);
      fs.writeFileSync("examples.json", StringJson);
    });
}

// getAllExamples();
