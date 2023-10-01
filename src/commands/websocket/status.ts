import { Manager } from "../../manager.js";
import { PlaylistTrackInterface } from "../../types/Playlist.js";

export default {
  name: "status",
  run: async (client: Manager, json: Record<string, any>, ws: WebSocket) => {
    if (!json.user)
      return ws.send(
        JSON.stringify({ error: "0x115", message: "No user's id provided" }),
      );
    if (!json.guild)
      return ws.send(
        JSON.stringify({ error: "0x120", message: "No guild's id provided" }),
      );
    const player = client.manager.getQueue(json.guild);

    const Guild = await client.guilds.fetch(json.guild);
    const Member = await Guild.members.fetch(json.user);

    function playerState() {
      if (!player) return false;
      else if (player) return true;
    }

    const song = player?.songs[0];
    let webqueue: PlaylistTrackInterface[] = [];

    if (player?.songs)
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
        op: "status",
        guild: player?.id,
        loop: player?.repeatMode,
        member: !Member.voice.channel || !Member.voice ? false : true,
        pause: player?.paused,
        playing: playerState(),
        position: player?.currentTime,
        current: song
          ? {
              title: song.name,
              uri: song.url,
              length: song.duration,
              thumbnail: song.thumbnail,
              author: song.uploader,
              requester: song.member,
            }
          : null,
        queue: webqueue ? webqueue : null,
      }),
    );
  },
};
