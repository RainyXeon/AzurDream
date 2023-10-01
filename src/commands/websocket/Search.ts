import { Manager } from "../../manager.js";

export default {
  name: "search",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const result = await client.manager.search(json.query);

    ws.send(JSON.stringify({ op: "search", guild: json.guild, queue: result }));
  },
};
