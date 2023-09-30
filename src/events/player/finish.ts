import { Queue } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue) => {
  await client.UpdateMusic(queue);
  await client.manager.voices.leave(queue.textChannel!.guild);

  const embed = new EmbedBuilder()
    .setDescription(`\`📛\` | **Song has been:** \`Ended\``)
    .setColor(client.color);

  queue.textChannel!.send({ embeds: [embed] });
};
