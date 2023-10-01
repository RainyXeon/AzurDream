import { Manager } from "../../manager.js";

export default {
  name: "status.loop",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.getQueue(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );
    return ws.send(
      JSON.stringify({
        op: "loop_queue",
        guild: player.id,
        status: player.repeatMode,
      }),
    );
  },
};
