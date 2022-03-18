import { WebSocket } from "ws";
import express from "express";
import getInviteData from "../discordapiutils/getInviteData";
import cors from "cors";
import { selfData } from "../discordapiutils/selfData";
import { Settings, trackserver } from "../discordapiutils/websocket";
import dotenv from "dotenv";
import { checkTracking } from "./middleware";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
const port: number | string = process.env.port || 3080;

interface WebSocketStorage {
  websocket: WebSocket;
  id: string;
  url?: string;
}

let trackingArray: WebSocketStorage[] = [];
export interface TrackBody {
  guildID: string;
  filters: { filter: string; response: string }[];
  token: string;
  userID: string;
  settings: Settings;
  id: string;
}
app.get("/api/invite/:code", async (req, res) => {
  const code: string = req.params.code;
  const data: any = await getInviteData(code);
  console.log(data);
  res.json(data);
});

app.get("/api/self/:token", async (req, res) => {
  const token: string = req.params.token;
  const data: any = await selfData(token);
  console.log(data);
  res.json(data);
});

app.post("/api/track", checkTracking, async (req, res) => {
  console.log("in track");
  const body: TrackBody = req.body;
  console.log(body);
  const { guildID, filters, token, userID, settings, id } = body;
  const finish = await trackserver(guildID, token, filters, settings, userID);
  trackingArray.push({ websocket: finish, id: id });
  res.status(200).json({ id });
  console.log("adding id:", id);
  const mappedArr = trackingArray.map((element) => element.id);
  console.log(mappedArr);
});

app.delete("/api/track", async (req, res) => {
  const body: { id: string } = req.body;
  const { id } = body;

  const storage: WebSocketStorage | undefined = trackingArray.find((element) => (element.id = id));
  if (storage) {
    console.log("removing id: ", id);
    storage.websocket.close();
    trackingArray = trackingArray.filter((element: WebSocketStorage) => element.id !== id);
    res.status(200).json({ id, message: "removed specified id" });
    const mappedArr = trackingArray.map((element) => element.id);
    console.log(mappedArr);
  } else res.status(500).json({ error: "ID not found" });
});

app.listen(port, () => {
  console.log("listening on port", port);
});
