import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Playlist, Queue } from "distube";

export default async (client: Manager, queue: Queue, playlist: Playlist) => {

  const data = await client.queue_message.get(String(playlist.user!.id))
  const msg = await queue.textChannel!.messages.cache.get(data);

  const embed = new EmbedBuilder()
      .setDescription(`**Queued • [${playlist.name}](${playlist.url})** \`${queue.formattedDuration}\` (${playlist.songs.length} tracks) • ${playlist.user}`)
      .setColor('#000001')
  
  await msg!.edit({ content: " ", embeds: [embed] })
  await client.queue_message.delete(String(playlist.user?.id))
}