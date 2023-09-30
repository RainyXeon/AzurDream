import { Queue, Song } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue, song: Song) => {
  const channel_id = await client.queue_message.get(String(song.user?.id));
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;

  const msg = await queue.textChannel!.messages.cache.get(channel_id);

  const embed = new EmbedBuilder()
    .setDescription(
      `**Queued • [${song.name}](${song.url})** \`${song.formattedDuration}\` • ${song.user}`,
    )
    .setColor(client.color);

  if (msg) await msg!.edit({ content: " ", embeds: [embed] });

  await client.queue_message.delete(String(song.user?.id));
};
