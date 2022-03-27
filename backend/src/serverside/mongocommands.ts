import { Server, Settings } from "./../discordapiutils/websocket";
import { Document, MongoClient, WithId } from "mongodb";

export interface KeyData {
  key: string;
  token: string;
  servers: Server[];
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

export const clearServers = async (key: string): Promise<void> => {
  await client
    .db("xpgrinder")
    .collection("keys")
    .updateOne({ key: key }, { $set: { servers: [] } }, { upsert: true });
};
