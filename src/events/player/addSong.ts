import { Queue, Song } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue, song: Song) => {
  console.log("Exec")
  console.log(await queue.textChannel)
  const channel_id = await client.queue_message.get(String(song.user?.id))
  const msg = await queue.textChannel!.messages.cache.get(channel_id);

  const embed = new EmbedBuilder()
      .setDescription(`**Queued • [${song.name}](${song.url})** \`${song.formattedDuration}\` • ${song.user}`)
      .setColor(client.color)

  await msg!.edit({ content: " ", embeds: [embed] })

  await client.queue_message.delete(String(song.user?.id))
}