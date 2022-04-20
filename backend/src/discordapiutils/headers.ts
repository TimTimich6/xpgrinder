import axios from "axios";
export const getCookie = async (): Promise<string> => {
  const response: any = await axios.get("http://discord.com");
  // console.log(response);
  const cookieArray: string[] = response.headers["set-cookie"];
  const cookie: string = cookieArray.join(";");
  return cookie;
};

export const userAgent: string =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.263 Chrome/83.0.4103.122 Electron/9.3.5 Safari/537.36";

export const referer: string = "https://discord.com/channels/@me";

export const secProps = {
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "sec-fetch-dest": "empty",
};
export const xsuperProperties =
  "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEwMC4wLjQ4OTYuODggU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6IjEwMC4wLjQ4OTYuODgiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHA6Ly8xMjcuMC4wLjE6NTUwMC8iLCJyZWZlcnJpbmdfZG9tYWluIjoiMTI3LjAuMC4xOjU1MDAiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MTI0ODIzLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==";

export const xcontextproperties =
  "eyJsb2NhdGlvbiI6IkpvaW4gR3VpbGQiLCJsb2NhdGlvbl9ndWlsZF9pZCI6IjkxNjUzNjExNjY4ODA4MDk4NyIsImxvY2F0aW9uX2NoYW5uZWxfaWQiOiI5MTc2OTAxMDcwOTAzMTMyMTYiLCJsb2NhdGlvbl9jaGFubmVsX3R5cGUiOjB9";
export default {
  referer: referer,
  "content-type": "application/json",
  "user-agent": userAgent,
  "x-super-properties": xsuperProperties,
  xcontextproperties,
  ...secProps,
};
