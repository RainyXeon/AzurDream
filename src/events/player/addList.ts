import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Playlist, Queue } from "distube";

export default async (client: Manager, queue: Queue, playlist: Playlist) => {
  const data = await client.queue_message.get(String(playlist.user!.id));
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;
  const msg = await queue.textChannel!.messages.cache.get(data);

  const embed = new EmbedBuilder()
    .setDescription(
      `**Queued • [${playlist.name}](${playlist.url})** \`${queue.formattedDuration}\` (${playlist.songs.length} tracks) • ${playlist.user}`,
    )
    .setColor(client.color);

  if (msg) await msg!.edit({ content: " ", embeds: [embed] });
  await client.queue_message.delete(String(playlist.user?.id));
};
