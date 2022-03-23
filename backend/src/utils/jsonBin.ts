import { JsonBinIoApi, JSONObject } from "jsonbin-io-api";
const api = new JsonBinIoApi("$2b$10$/HwW4Ggy8nlHZxSKQJamg.sVgmXbl/cqqYmNNgxBm57g9guxK5Jge");

export default async (id: string): Promise<JSONObject> => {
  const data = await api.bins.read({
    binId: id,
  });
  return data.record;
};
