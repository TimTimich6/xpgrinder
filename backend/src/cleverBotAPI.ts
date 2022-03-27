import axios from "axios";
const key: string = process.env.CLEVERBOT!;
const receiveMessage = async (input?: string): Promise<string> => {
  const baseUrl: string = "https://www.cleverbot.com/getreply";

  // console.log("key: " + key);
  const resp: any = await axios
    .get(baseUrl + "?key=" + key + "&input=" + input)
    .then((resp) => resp.data.output)
    .catch((err) => console.log(err.response.data.error));
  return resp;
};
export { receiveMessage };
