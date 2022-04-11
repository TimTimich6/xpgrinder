import { Server } from "./../discordapiutils/websocket";
import * as mongo from "./mongocommands";
import { WebSocket } from "ws";
import express, { application } from "express";
import readBin from "../utils/jsonBin";
import getInviteData from "../discordapiutils/getInviteData";
import { selfData } from "../discordapiutils/selfData";
import { SocketTracker } from "../discordapiutils/websocket";
import dotenv from "dotenv";
import { checkTracking, authKey } from "./middleware";
import { spamMessages, testSend } from "../discordapiutils/sendmessage";

dotenv.config();
const app = express();
app.use(express.json());

const port: number | string = process.env.port || 3080;

interface TrackingStorage {
  websocket?: SocketTracker;
  key: string;
  intervals?: NodeJS.Timer[];
}
export interface ErrorResponse {
  title: string;
  description: string;
  code?: number;
}

let trackingArray: TrackingStorage[] = [];

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

app.post("/api/track", authKey, checkTracking, async (req, res, next) => {
  const servers: Server[] = req.body.servers;
  const token: string = req.body.token;
  const key: string = <string>req.headers["testing-key"];
  const userid: string = req.body.userid;
  if (trackingArray.some((storage) => storage.key == key))
    res.status(500).json({ title: "Tracking Error", description: "Instance already tracking" });
  else {
    let storageCell: TrackingStorage = { key };
    const spamServers = servers.filter((server) => server.settings.spamChannel.length == 18 && server.tracking);
    const regularTrack = servers.filter((server) => server.settings.spamChannel.length != 18 && server.tracking);
    if (regularTrack.length > 0) {
      const socket = new SocketTracker(req.body.token, regularTrack, req.body.webhook);
      if (socket) storageCell.websocket = socket;
    }
    if (spamServers.length > 0) {
      let spamIntervals: NodeJS.Timer[] = [];
      for (const server of spamServers) {
        const test = await testSend("Hi everyone!", token, server.settings.spamChannel);
        if (!test) {
          console.log("sending failure");
          res.status(403).json({ title: "Spam Error", description: "Spamming channel couldn't be accessed" });
          return next();
        }
        spamIntervals.push(await spamMessages(server.settings.spamChannel, req.body.token, server.settings.responseTime));
      }
      storageCell.intervals = spamIntervals;
    }

    trackingArray.push(storageCell);
    console.log("LENGTH OF TRACKING AFTER ADD:", trackingArray.length);
    console.log(trackingArray.map((elem) => elem.key));
    req.body.key = key;
    await mongo.replaceKey(req.body);
    res.status(200).json(req.body);
  }
});

app.delete("/api/track", authKey, async (req, res) => {
  const { servers } = req.body;
  const key = <string>req.headers["testing-key"];
  const storage: TrackingStorage | undefined = trackingArray.find((element) => element.key == key);
  if (storage) {
    console.log("removing servers from key: ", key, "index: ", trackingArray.indexOf(storage));
    if (storage.websocket) storage.websocket.stop();
    if (storage.intervals && storage.intervals.length > 0) storage.intervals.forEach((interval) => clearInterval(interval));
    trackingArray.splice(trackingArray.indexOf(storage), 1);
    res.status(200).json({ key, message: "stop tracking all servers" });
    console.log(trackingArray.map((elem) => elem.key));
  } else {
    res.status(500).json({ title: "Tracking Error", description: "Something went wrong when deactivating the tracking" });
  }
  console.log("LENGTH OF TRACKING AFTER DELETE:", trackingArray.length);
  await mongo.clearTracking(key, servers);
});

app.delete("/api/servers", authKey, async (req, res) => {
  await mongo.overwriteServers(<string>req.headers["testing-key"], req.body.servers);
  res.status(200).json("overwrote servers with body");
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

app.get("/api/servers", (req, res) => {
  if (req.headers["testing-key"] == "timkey") res.status(200).json(trackingArray.map((elem) => elem.key));
  else res.status(403).json("unauthorized key");
});
app.listen(port, () => {
  console.log("listening on port", port);
});
