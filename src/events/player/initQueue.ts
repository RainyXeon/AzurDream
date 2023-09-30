import { Queue, Song } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";
import yts from "yt-search";

export default async (client: Manager, queue: Queue) => {
  queue.setVolume(100);
};
