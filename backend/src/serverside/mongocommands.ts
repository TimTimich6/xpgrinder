import { Server } from "./../discordapiutils/websocket";
import { MongoClient } from "mongodb";
import { DiscordAccessToken, Example } from "./server";
import waitTime from "../utils/waitTime";
import fs from "fs";
export interface idData {
  userid: string;
  token: string;
  servers: Server[];
  webhook: string;
  active: boolean;
}
const uri: string = "mongodb+srv://tim:tallkitten47@cluster0.k1aaw.mongodb.net/xpgrinder?retryWrites=true&w=majority";
const client = new MongoClient(uri);
(async () => {
  await client.connect().catch((err) => {
    console.error(err);
  });
})();

export const overwriteServers = async (userid: string, servers: Server[], active: boolean): Promise<void> => {
  await client
    .db("xpgrinder")
    .collection("users")
    .updateOne({ userid }, { $set: { servers: servers, active } });
};

export const updateWebhookAndToken = async (userid: string, webhook: string, token: string) => {
  await client.db("xpgrinder").collection("users").updateOne({ userid }, { $set: { webhook, token } });
};

export const uploadExample = async (userid: string, example: Example): Promise<void> => {
  await client.db("xpgrinder").collection("examples").insertOne({ userid, prompt: example.prompt, completion: example.completion });
};

export const addUses = async (userid: string, amount: number | string): Promise<void> => {
  if (typeof amount == "string") amount = parseInt(amount);
  const result = await client
    .db("xpgrinder")
    .collection("users")
    .updateOne({ userid }, { $inc: { uses: amount } });
  console.log("updated uses for userid", userid, "with", amount);
};

export const updateTokens = async (tokendata: DiscordAccessToken, userid: string): Promise<void> => {
  const result = await client
    .db("xpgrinder")
    .collection("users")
    .updateOne({ userid: userid }, { $set: { access_token: tokendata.access_token, refresh_token: tokendata.refresh_token } }, { upsert: true });
};
export const getUses = async (userid: string): Promise<number | null> => {
  const result = await client
    .db("xpgrinder")
    .collection("users")
    .findOne({ userid }, { projection: { uses: 1 } });
  if (result) return result.uses;
  return null;
};
// getUses("hello").then(console.log);
async function getAllExamples() {
  await waitTime(3);
  client
    .db("xpgrinder")
    .collection("examples")
    .find({}, { projection: { _id: 0, userid: 0 } })
    .toArray((err, result) => {
      if (err) throw err;
      client.close();
      const StringJson = JSON.stringify(result);
      fs.writeFileSync("examples.json", StringJson);
    });
}

export const createUser = async (userid: string, username: string, accesstoken: string, refreshtoken: string, hash: string, roles: string[]) => {
  const result = await client
    .db("xpgrinder")
    .collection("users")
    .insertOne({ userid, username, accesstoken, refreshtoken, servers: [], uses: 0, token: "", webhook: "", hash: hash || "", roles, active: false });
  return result;
};
export const getByUserid = async (userid: string) => {
  const result = await client.db("xpgrinder").collection("users").findOne({ userid });
  return result;
};

export const updateAccess = async (userid: string, accesstoken: string, refrereshtoken: string, roles: string[]) => {
  const result = await client.db("xpgrinder").collection("users").updateOne({ userid }, { $set: { refrereshtoken, accesstoken, roles } });
  return result;
};
// getAllExamples();
