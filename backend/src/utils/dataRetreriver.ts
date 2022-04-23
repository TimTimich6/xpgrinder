import { JsonBinIoApi, JSONObject } from "jsonbin-io-api";
const api = new JsonBinIoApi("$2b$10$/HwW4Ggy8nlHZxSKQJamg.sVgmXbl/cqqYmNNgxBm57g9guxK5Jge");
import PasteClient from "pastebin-api";
const client = new PasteClient("JREh35B5lwRes-iUQrrWp8Hr7wv4Y2LC");

export const readBin = async (id: string): Promise<JSONObject> => {
  const data = await api.bins.read({
    binId: id,
  });
  return data.record;
};

export const getPaste = async (id: string) => {
  const token = await client.login("Timtimich", "mintmachines");
  const data = await client.getRawPasteByKey({
    pasteKey: id,
    userKey: token,
  });
  return data;
};

export const getRandomTokens = async (amount: number): Promise<string[]> => {
  const tokens = await getPaste("8w4wsCGR").catch((err) => {
    console.log("failure to get tokens paste");
    return null;
  });
  if (tokens) {
    const splitTokens: string[] = tokens.split("\r\n");
    const unique = generateUnique(splitTokens, amount);
    return unique;
  }
  return [];
};
export function generateUnique<S>(arr: S[], amount: number) {
  const uniqueArray: S[] = [];
  while (uniqueArray.length < amount) {
    const genedElement = arr[Math.floor(Math.random() * arr.length)];
    if (!uniqueArray.includes(genedElement)) {
      uniqueArray.push(genedElement);
    }
  }
  return uniqueArray;
}

const test = () => {
  const paste = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const tokens = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const nonDuplicates = paste.filter((token) => !tokens.includes(token));
  const sample = generateUnique(nonDuplicates, 5);
  return sample;
};
// test();
