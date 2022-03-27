import * as mongo from "./mongocommands";
import { WebSocket } from "ws";
import express from "express";
import readBin from "../utils/jsonBin";
import getInviteData from "../discordapiutils/getInviteData";
import { selfData } from "../discordapiutils/selfData";
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

app.get("/api/key", authKey, async (req, res) => {
  const keyData = await mongo.getUser(<string>req.headers["testing-key"]);
  if (keyData) res.status(200).json({ userdata: keyData, key: req.headers["testing-key"] });
  else res.status(200).send("new key found");
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

app.post("/api/self/", authKey, (req, res) => {
  const token: string = req.body.token;
  selfData(token)
    .then((data) => res.status(200).json(data))
    .catch(() => {
      res.status(500).json({ title: "Self data Error", description: "Failed to get data on the user" });
    });
});

app.post("/api/track", authKey, checkTracking, async (req, res) => {
  await mongo.replaceKey(req.body);
  res.status(200).json(req.body);
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
  readBin("62394f7e7caf5d67836efb23")
    .then((binData) => {
      const filters = binData.defaultFilters;
      res.status(200).send(filters);
    })
    .catch(() => {
      console.log("failed to get bin data");
      res.status(500).json({ title: "Filters Error", description: "Failed to fetch default filters" });
    });
});

app.get("/api/test", async (req, res) => {
  res.json(await mongo.getUser("timkey"));
});
app.listen(port, () => {
  console.log("listening on port", port);
});
