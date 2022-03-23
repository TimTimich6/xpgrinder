import axios, { AxiosInstance, AxiosResponse } from "axios";
import HttpsProxyAgent from "https-proxy-agent";
// import axiosRetry from 'axios-retry';
// axiosRetry(axios, { retries: 3 });
const httpClient: AxiosInstance = axios.create();
httpClient.defaults.timeout = 15000;
// const httpsAgent = new HttpsProxyAgent.HttpsProxyAgent(`http://zabra:qsmsoijITfkEU2VG@proxy.packetstream.io:31112`);

interface inviteResponse {
  data: any;
}
interface inviteData {
  guildID: string;
  iconHash: string;
  serverIcon: string;
  guildName: string;
  channelDefault: string;
}
export default async (code: string): Promise<inviteData> => {
  console.log("in axios");
  const server_invite: any = await axios.get<inviteResponse>(`https://discord.com/api/v9/invites/${code}`);
  if (server_invite.error) throw new Error();
  const data = server_invite.data;
  const guildID: string = data.guild.id;
  const iconHash: string = data.guild.icon;
  const serverIcon: string = `https://cdn.discordapp.com/icons/${guildID}/${iconHash}.png`;
  const guildName: string = data.guild.name;
  const channelDefault: string = data.channel.id;
  return { guildID, iconHash, serverIcon, guildName, channelDefault };
};
