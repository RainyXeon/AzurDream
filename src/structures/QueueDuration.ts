import { Queue, Song } from "distube";

function QueueDuration(player: Queue) {
  const current = player.songs[0]!.duration ?? 0;
  return player.songs.reduce((acc, cur) => acc + (cur.duration || 0), current);
}

function StartQueueDuration(tracks: Song[]) {
  const current = tracks[0].duration ?? 0;
  return tracks.reduce((acc, cur) => acc + (cur.duration || 0), current);
}
export { QueueDuration, StartQueueDuration };
