import { hasRole, isAuthed, secret } from "./auth";
import { Server } from "./../discordapiutils/websocket";
import * as mongo from "./mongocommands";
import express from "express";
import { getRandomTokens, readBin, readPantry } from "../utils/dataRetreriver";
import { getInviteData } from "../discordapiutils/getInviteData";
import { selfData } from "../discordapiutils/selfData";
import { SocketTracker } from "../discordapiutils/websocket";
import { checkTracking, checkInvite, InviteRequest, checkUses } from "./middleware";
import { spamMessages, testSend } from "../discordapiutils/sendmessage";
import { Inviter } from "../discordapiutils/inviter";
import axios, { AxiosError } from "axios";
import url from "url";
import { restartHook } from "./serverwebhook";
import ip from "ip";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { howManyHolding } from "../utils/other";

const app = express();
app.use(express.json());
app.use(cors());
const port: number | string = process.env.port || 3080;

interface TrackingStorage {
  websocket?: SocketTracker;
  userid: string;
  intervals?: NodeJS.Timer[];
}
interface InviterActive {
  inviter: Inviter;
  userid: string;
}
export interface Example {
  prompt: string;
  completion: string;
}

interface SharedServers {
  userid: string;
  server: Server;
  userhash: string;
  username: string;
}

let trackingArray: TrackingStorage[] = [];
const ongoingInvitations: InviterActive[] = [];
const sharedservers: SharedServers[] = [];
console.log("base url", process.env.BASEURL);

const baseredirect = process.env.BASEURL || "https://xpgrinder.xyz/api/auth/redirect";
const authURL = `https://discord.com/api/oauth2/authorize?client_id=967841162905915452&redirect_uri=${encodeURIComponent(
  baseredirect
)}&response_type=code&scope=identify%20guilds.members.read`;

app.get("/api/invite/:code", (req, res) => {
  const code: string = req.params.code;
  getInviteData(code)
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log("Failed data on invite");
      res.status(500).json({ title: "Invite Error", description: "Can't get data on invite" });
    });
});

app.post("/api/self/", isAuthed, hasRole, (req: any, res) => {
  const token: string = req.body.token;
  selfData(token)
    .then((data) => {
      mongo.updateOnlyToken(<string>req.jwt.userid, token);
      res.status(200).json(data);
    })
    .catch(() => {
      res.status(500).json({ title: "Self data Error", description: "Failed to get data on the user" });
    });
});
app.get("/api/user", isAuthed, hasRole, async (req: any, res) => {
  const user = req.user;
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(500).json({ title: "User error", description: "Couldn't find user" });
  }
});
app.get("/api/auth/discord", (req, res) => {
  res.redirect(authURL);
});

app.get("/api/auth/redirect", async (req, res) => {
  console.log(req.query);
  const { code } = req.query;
  try {
    if (code) {
      const body = {
        client_id: "967841162905915452",
        client_secret: "wSGJRY3vUgdQrkF_ppKMxBaXZjQqjRlz",
        grant_type: "authorization_code",
        code: code.toString(),
        redirect_uri: process.env.BASEURL || "https://xpgrinder.xyz/api/auth/redirect",
      };
      const encoded = new url.URLSearchParams(body);
      const form = encoded.toString();
      const { data } = await axios
        .post<DiscordAccessToken>(`https://discord.com/api/oauth2/token`, form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .catch((err: AxiosError<Oauth2Error>) => {
          if (axios.isAxiosError(err) && err.response?.status == 400) {
            return { data: err.response.data };
          } else {
            console.log("unexpected error in oauth token: ", err);
            throw new Error("An unexpected error occurred");
          }
        });
      if ("access_token" in data) {
        // const userResp = await axios
        //   .get<userData>("https://discord.com/api/v8/users/@me", { headers: { Authorization: "Bearer " + data.access_token } })
        //   .catch((err) => null);
        // if (userResp) {
        //   console.log(userResp.data);
        // }
        const memberData = await axios
          .get<GuildMember>("https://discord.com/api/v8/users/@me/guilds/934702825328504843/member", {
            headers: { Authorization: "Bearer " + data.access_token },
          })
          .catch((err) => null);
        if (memberData) {
          const user = memberData.data.user;
          const result = await mongo.getByUserid(memberData.data.user.id);
          const token = jwt.sign({ userid: memberData.data.user.id }, secret, { expiresIn: "1d" });
          res.cookie("jwt", token);
          const holder = howManyHolding(memberData.data.roles);
          if (!result) {
            await mongo.createUser(user.id, user.username, data.access_token, data.refresh_token, user.avatar, memberData.data.roles, holder);
          } else {
            await mongo.updateAccess(user.id, data.access_token, data.refresh_token, memberData.data.roles, holder);
          }
          console.log(memberData.data);
        } else console.log("couldn't get memberdata");
      } else console.log("no access token in response");

      res.redirect(process.env.BASEURL ? "http://localhost:3000" : "https://xpgrinder.xyz/");
    }
  } catch (error) {
    return res.status(500).json({ title: "Auth error", description: "Error when trying to authorize, try again" });
  }
});

app.get("/api/protectedroute", isAuthed, (req, res) => {
  res.send("200");
});
app.post("/api/track", isAuthed, hasRole, checkTracking, async (req: any, res, next) => {
  const servers: Server[] = req.body.servers;
  const token: string = req.body.token;
  const userid = req.jwt.userid;
  const storage = trackingArray.find((el) => el.userid == userid);
  if (storage) {
    if (storage.websocket) storage.websocket.stop();
    if (storage.intervals && storage.intervals.length > 0) storage.intervals.forEach((interval) => clearInterval(interval));
    trackingArray.splice(trackingArray.indexOf(storage), 1);
  }
  let storageCell: TrackingStorage = { userid };
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
  console.log(trackingArray.map((elem) => elem.userid));
  mongo.overwriteServers(userid, servers, true);
  mongo.updateWebhookAndToken(userid, req.body.webhook, req.body.token);
  res.status(200).json(req.body);
});

app.delete("/api/track", isAuthed, async (req: any, res) => {
  const { servers } = req.body;
  const userid = <string>req.jwt.userid;
  const storage: TrackingStorage | undefined = trackingArray.find((element) => element.userid == userid);
  try {
    if (storage) {
      console.log("removing servers from userid: ", userid, "index: ", trackingArray.indexOf(storage));
      if (storage.websocket) storage.websocket.stop();
      if (storage.intervals && storage.intervals.length > 0) storage.intervals.forEach((interval) => clearInterval(interval));
      if (storage.websocket?.active == false || !storage.intervals?.some((int) => int.hasRef())) {
        res.status(200).json({ userid, message: "stop tracking all servers" });
        trackingArray = trackingArray.filter((storage) => storage.userid !== req.jwt.userid);
      } else throw new Error();
      console.log(trackingArray.map((elem) => elem.userid));
    } else res.status(200).json({ userid, message: "tracking doesnt exist" });
    console.log("LENGTH OF TRACKING AFTER DELETE:", trackingArray.length);
    await mongo.overwriteServers(userid, servers, false);
  } catch (error) {
    return res.status(500).json({ title: "Tracking Error", description: "Failed to stop tracking, try stopping again" });
  }
});

app.delete("/api/servers", isAuthed, async (req: any, res) => {
  const userid = <string>req.jwt.userid;
  const storage: boolean = trackingArray.some((element) => element.userid == userid);
  if (storage) {
    return res.status(500).json({ title: "Servers Error", description: "Can't delete server when actively tracking" });
  } else {
    await mongo.overwriteServers(userid, req.body.servers, req.body.active);
    res.status(200).json("overwrote servers with body");
  }
});

app.get("/api/filters", isAuthed, hasRole, (req, res) => {
  readPantry("defaultfilters")
    .then((binData) => {
      const filters = binData.defaultFilters;
      res.status(200).send(filters);
    })
    .catch(() => {
      console.log("failed to get pantry data");
      res.status(500).json({ title: "Filters Error", description: "Failed to fetch default filters" });
    });
});

app.post("/api/example", isAuthed, async (req: any, res) => {
  const userid = <string>req.jwt.userid;

  const { prompt, completion } = req.body;
  if (prompt.length <= 0 || completion.length <= 0) res.status(500).json({ title: "Upload Error", description: "Invalid upload data detected" });
  else {
    await mongo.uploadExample(userid, { prompt, completion });
    res.status(200).json("Uploaded example successfully");
  }
});

app.post("/api/invite", isAuthed, hasRole, checkInvite, checkUses, async (req: any, res) => {
  const params: InviteRequest = req.body;
  const userid = <string>req.jwt.userid;
  const alreadyExists = ongoingInvitations.find((el) => (el.userid = userid));
  if (alreadyExists) {
    if (!alreadyExists.inviter.active) ongoingInvitations.filter((invitation) => invitation.userid != userid);
    else return res.status(500).json({ title: "Invite Error", description: "Invitation already sending out. Interrupt the previous process" });
  }
  const unique = await getRandomTokens(params.amount);
  if (unique) {
    const inviteInstance = new Inviter(params, unique, userid);
    ongoingInvitations.push({ inviter: inviteInstance, userid });
    return res.status(200).send("success");
  } else return res.status(500).json({ title: "Invite Error", description: "Couldn't get tokens, try again or contact timlol" });
});

app.delete("/api/invite", isAuthed, async (req: any, res) => {
  const userid = <string>req.jwt.userid;
  const inviteProcess = ongoingInvitations.find((element) => element.userid == userid);
  if (inviteProcess) {
    if (inviteProcess.inviter.active == false) return res.status(500).json({ title: "Invite Error", description: "No active process is happening" });
    inviteProcess.inviter.interrupt();
    return res.status(200).json("Successfully stopped");
  } else {
    return res.status(500).json({ title: "Invite Error", description: "Failed to interrupt inviter or no active process is happening" });
  }
});

app.get("/api/servers", isAuthed, (req: any, res) => {
  if (<string>req.jwt.userid == "516369143046340608") res.status(200).json(trackingArray.map((elem) => elem.userid));
});

app.get("/api/serverotd", async (req, res) => {
  try {
    const result = await readPantry("serverotd");
    console.log(result);
    if (result) {
      res.json(result);
    }
  } catch (err) {
    res.status(403).send("failed to get serverotd");
  }
});

app.post("/api/share", isAuthed, hasRole, (req: any, res) => {
  const userid: string = <string>req.jwt.userid;
  const server: Server = req.body.server;

  let foundcount = 1;
  let uuidexists = false;
  sharedservers.forEach((instance) => {
    if (instance.userid == userid) foundcount++;
    if (instance.server.uuid == server.uuid) uuidexists = true;
  });
  if (foundcount > 3) {
    return res.status(500).json({ title: "Too many shares", description: "Too many servers are shared by you already" });
  } else if (uuidexists) return res.status(500).json({ title: "Already sharing", description: "Server is already being shared" });
  const username: string = req.body.username;
  const userhash: string = req.body.userhash;

  sharedservers.push({ server, userid, username, userhash });
  res.status(200).json("success");
});

app.get("/api/share", isAuthed, hasRole, (req: any, res) => {
  if (sharedservers.length > 0) {
    res.json(
      sharedservers.map((instance) => {
        const baseserver = {
          guildname: instance.server.name,
          imghash: instance.server.img,
          guildid: instance.server.guildID,
          userid: instance.userid,
          uuid: instance.server.uuid,
          userhash: instance.userhash,
          username: instance.username,
        };
        return baseserver;
      })
    );
  } else res.status(400).json({ title: "No shared servers", description: "There are currently no shared servers" });
});

app.put("/api/share", isAuthed, hasRole, (req: any, res) => {
  const uuid = req.query.uuid;
  try {
    const instance = sharedservers.find((instance) => instance.server.uuid == uuid);
    if (instance) return res.json(instance.server);
    else throw new Error();
  } catch (error) {
    return res.status(404).json({ title: "Not found", description: "Shared server was not found, refresh" });
  }
});

app.delete("/api/share", isAuthed, hasRole, (req: any, res) => {
  const userid: string = <string>req.jwt.userid;
  const uuid = req.query.uuid;
  try {
    const instance = sharedservers.find((instance) => instance.server.uuid == uuid);
    if (instance?.userid == userid) {
      sharedservers.splice(sharedservers.indexOf(instance), 1);
      res.json("deleted");
    } else throw new Error();
  } catch (error) {
    return res.status(404).json({ title: "Shared Server Error", description: "Couldn't delete the shared server, try refreshing servers" });
  }
});

app.listen(port, () => {
  console.log("listening on port", port);
  console.log(ip.address());

  if (ip.address() != "192.168.0.238")
    restartHook()
      .then(() => console.log("send start hook"))
      .catch(() => console.log("failed to send restart hook"));
});

export interface DiscordAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface Oauth2Error {
  error: string;
  error_description: string;
}

export interface GuildMember {
  roles: string[];
  nick: string | null;
  avatar: string | null;
  premium_since: string | null;
  joined_at: string;
  is_pending: boolean;
  pending: boolean;
  communication_disabled_until: string | null;
  flags: number;
  user: User;
  mute: boolean;
  deaf: boolean;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration: null;
  discriminator: string;
  public_flags: number;
}
