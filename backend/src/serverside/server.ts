import { WebSocket } from "ws";
import express from "express";
import readBin from "../utils/jsonBin";
import getInviteData from "../discordapiutils/getInviteData";
import { selfData, userData } from "../discordapiutils/selfData";
import { Settings, trackserver } from "../discordapiutils/websocket";
import dotenv from "dotenv";
import { checkTracking, authKey } from "./middleware";

dotenv.config();
const app = express();
app.use(express.json());

const port: number | string = process.env.port || 3080;

interface WebSocketStorage {
  websocket: WebSocket;
  id: string;
  url?: string;
}
export interface ErrorResponse {
  title: string;
  description: string;
  code?: number;
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

app.get("/api/key", authKey, (req, res) => {
  res.status(200).send("Key authorized!");
});

app.get("/api/invite/:code", (req, res) => {
  const code: string = req.params.code;
  getInviteData(code)
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Failed axios");
      res.status(500).json({ title: "Invite Error", description: "Can't get data on invite" });
    });
});

app.get("/api/self/:token", (req, res) => {
  const token: string = req.params.token;
  selfData(token)
    .then((data) => res.status(200).json(data))
    .catch(() => {
      res.status(500).json({ title: "Self data Error", description: "Failed to get data on the user" });
    });
});

app.post("/api/track", authKey, checkTracking, async (req, res) => {
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

app.delete("/api/track", authKey, async (req, res) => {
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
  } else {
    const error: ErrorResponse = { title: "Tracking Error", description: "Something went wrong when deactivating the tracking" };
    res.status(500).json(error);
  }
});

app.get("/api/filters", authKey, (req, res) => {
  readBin("62394f7e7caf5d67836efb2")
    .then((binData) => {
      const filters = binData.defaultFilters;
      res.status(200).send(filters);
    })
    .catch(() => {
      res.status(500).json({ title: "Filters Error", description: "Failed to fetch default filters" });
    });
});
app.listen(port, () => {
  console.log("listening on port", port);
});
