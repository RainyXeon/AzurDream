import { Manager } from "../../manager.js";

export default {
  name: "skip",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.getQueue(json.guild);
    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );

    if (player.songs.length == 0) {
      client.manager.voices.leave(player.id);
      return ws.send(
        JSON.stringify({ guild: player.id, op: "player_destroy" }),
      );
    }

    player.skip();
  },
};
