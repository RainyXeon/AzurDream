import { Manager } from "../../manager.js";

export default {
  name: "destroy",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" }),
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" }),
      );

    const Guild = client.guilds.cache.get(json.guild);
    const Member = Guild!.members.cache.get(json.user);

    await client.manager.voices.join(Member!.voice.channel!);
  },
};
