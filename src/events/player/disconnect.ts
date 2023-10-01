import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Queue } from "distube";

export default async (client: Manager, queue: Queue) => {
  await client.UpdateMusic(queue);
};
