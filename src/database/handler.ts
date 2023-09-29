import { Manager } from "../manager.js";

export async function handler(client: Manager) {
  ["data.js", "client.js"].forEach(async (data: string) => {
    (await import(`./setup/${data}`)).default(client);
  });
}
