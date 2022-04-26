import { Server } from "./../discordapiutils/websocket";
import * as mongo from "./mongocommands";
import express from "express";
import { getRandomTokens, readBin } from "../utils/dataRetreriver";
import { getInviteData } from "../discordapiutils/getInviteData";
import { selfData } from "../discordapiutils/selfData";
import { SocketTracker } from "../discordapiutils/websocket";
import dotenv from "dotenv";
import { checkTracking, authKey, checkInvite, InviteRequest, checkUses } from "./middleware";
import { spamMessages, testSend } from "../discordapiutils/sendmessage";
import { Inviter } from "../discordapiutils/inviter";

dotenv.config();
const app = express();
app.use(express.json());

const port: number | string = process.env.port || 3080;

interface TrackingStorage {
  websocket?: SocketTracker;
  key: string;
  intervals?: NodeJS.Timer[];
}
interface InviterActive {
  inviter: Inviter;
  key: string;
}
export interface Example {
  prompt: string;
  completion: string;
}
const trackingArray: TrackingStorage[] = [];
const ongoingInvitations: InviterActive[] = [];
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
  const key = <string>req.headers["testing-key"];
  const storage: TrackingStorage | undefined = trackingArray.find((element) => element.key == key);
  if (storage) {
    console.log("removing servers from key: ", key, "index: ", trackingArray.indexOf(storage));
    if (storage.websocket) storage.websocket.stop();
    if (storage.intervals && storage.intervals.length > 0) storage.intervals.forEach((interval) => clearInterval(interval));
    trackingArray.splice(trackingArray.indexOf(storage), 1);
    console.log(trackingArray.map((elem) => elem.key));
  }
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

app.post("/api/example", authKey, async (req, res) => {
  const { prompt, completion } = req.body;
  if (prompt.length <= 0 || completion.length <= 0) res.status(500).json({ title: "Upload Error", description: "Invalid upload data detected" });
  else {
    await mongo.uploadExample(<string>req.headers["testing-key"], { prompt, completion });
    res.status(200).json("Uploaded example successfully");
  }
});

app.post("/api/invite", checkInvite, authKey, checkUses, async (req, res) => {
  const params: InviteRequest = req.body;
  const key = <string>req.headers["testing-key"];
  const alreadyExists = ongoingInvitations.find((el) => (el.key = key));
  if (alreadyExists) {
    if (!alreadyExists.inviter.active) ongoingInvitations.filter((invitation) => invitation.key != key);
    else return res.status(500).json({ title: "Invite Error", description: "Invitation already sending out. Interrupt the previous process" });
  }
  const unique = await getRandomTokens(params.amount);
  if (unique) {
    const inviteInstance = new Inviter(params, unique, key);
    ongoingInvitations.push({ inviter: inviteInstance, key: <string>req.headers["testing-key"] });
    return res.status(200).send("success");
  } else return res.status(500).json({ title: "Invite Error", description: "Couldn't get tokens, try again or contact timlol" });
});

app.delete("/api/invite", authKey, async (req, res) => {
  const key = <string>req.headers["testing-key"];
  const inviteProcess = ongoingInvitations.find((element) => element.key == key);
  if (inviteProcess) {
    if (inviteProcess.inviter.active == false) return res.status(500).json({ title: "Invite Error", description: "No active process is happening" });
    inviteProcess.inviter.interrupt();
    return res.status(200).json("Successfully stopped");
  } else {
    return res.status(500).json({ title: "Invite Error", description: "Failed to interrupt inviter or no active process is happening" });
  }
});

app.get("/api/servers", (req, res) => {
  if (req.headers["testing-key"] == "timkey") res.status(200).json(trackingArray.map((elem) => elem.key));
  else res.status(403).json("unauthorized key");
});

app.listen(port, () => {
  console.log("listening on port", port);
});
