import { Server } from "./../discordapiutils/websocket";
import { Document, MongoClient, WithId } from "mongodb";
import { Example } from "./server";

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
