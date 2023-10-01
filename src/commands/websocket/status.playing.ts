import { Manager } from "../../manager.js";

export default {
  name: "status.playing",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.getQueue(json.guild);
    if (!player) {
      ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );
      return ws.send(
        JSON.stringify({ op: "player_destroy", guild: player!.id }),
      );
    } else if (player)
      return ws.send(JSON.stringify({ op: "player_create", guild: player.id }));
  },
};
