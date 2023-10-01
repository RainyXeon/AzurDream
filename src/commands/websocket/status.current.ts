import { Manager } from "../../manager.js";
import { PlaylistTrackInterface } from "../../types/Playlist.js";

export default {
  name: "status.current_track",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    const player = client.manager.getQueue(json.guild);

    if (!player)
      return ws.send(
        JSON.stringify({ error: "0x100", message: "No player on this guild" }),
      );

    const song = player.songs[0];
    let webqueue: PlaylistTrackInterface[] = [];

    player.songs.forEach((track) => {
      webqueue.push({
        title: String(track.name),
        uri: track.url,
        length: track.duration,
        thumbnail: track.thumbnail,
        author: String(track.uploader),
        requester: track.member, // Just case can push
      });
    });

    return ws.send(
      JSON.stringify({
        op: "player_start",
        guild: player.id,
        current: {
          title: song!.name,
          uri: song!.url,
          length: song!.duration,
          thumbnail: song!.thumbnail,
          author: song!.uploader,
          requester: song!.member,
        },
        queue: webqueue,
      }),
    );
  },
};
