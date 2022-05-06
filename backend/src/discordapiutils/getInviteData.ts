import axios, { AxiosInstance, AxiosResponse } from "axios";
import { agent } from "./selfData";

export interface Invite {
  code: string;
  type: number;
  expires_at: string;
  guild: Guild;
  channel: Channel;
  inviter: Inviter;
}

export interface Channel {
  id: string;
  name: string;
  type: number;
}

export interface Guild {
  id: string;
  name: string;
  splash: string;
  banner: string;
  description: null;
  icon: string;
  vanity_url_code: null;
}

export interface Inviter {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
}
interface inviteResponse {
  guildID: string;
  iconHash?: string;
  serverIcon: string;
  guildName: string;
  channelDefault?: string;
}

interface guildData extends Guild {
  approximateCount: number;
  approximateOnline: number;
  owner_id: string;
}

export const getInviteData = async (code: string): Promise<inviteResponse> => {
  console.log("in axios for invite data");
  const { data } = await axios.get<Invite>(`https://discord.com/api/v9/invites/${code}`, { httpsAgent: agent }).catch((err) => {
    if (axios.isAxiosError(err)) {
      console.log("error message: ", err.message);
      throw new Error(err.message);
    } else {
      console.log("unexpected error: ", err);
      throw new Error("An unexpected error occurred");
    }
  });
  const guildID: string = data.guild.id;
  const iconHash: string = data.guild.icon;
  const serverIcon: string = `https://cdn.discordapp.com/icons/${guildID}/${iconHash}.png`;
  const guildName: string = data.guild.name;
  return { guildID, serverIcon, guildName };
};

export const getGuildData = async (guildID: string, token: string): Promise<guildData> => {
  console.log("in axios for guild data");
  const { data } = await axios
    .get<guildData>(`https://discord.com/api/guilds/${guildID}?with_counts=true`, { headers: { authorization: token } })
    .catch((err) => {
      if (axios.isAxiosError(err)) {
        console.log("error message: ", err.message);
        throw new Error(err.message);
      } else {
        console.log("unexpected error: ", err);
        throw new Error("An unexpected error occurred");
      }
    });
  return data;
};

// getInviteData("4rPyXPPS");
// getGuildData("934702825328504843", "NTE2MzY5MTQzMDQ2MzQwNjA4.YkiK8Q.rzRmzkknTE5oaRYu3cOJACAqNqE");
