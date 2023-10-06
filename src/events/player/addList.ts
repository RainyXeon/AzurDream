import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Playlist, Queue } from "distube";

export default async (client: Manager, queue: Queue, playlist: Playlist) => {
  const data = await client.queue_message.get(String(playlist.user!.id));
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;
  const msg = await queue.textChannel!.messages.cache.get(data?.message!);

  let guildModel = await client.db.get(`language.guild_${queue.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${queue.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  const embed = new EmbedBuilder()
    .setDescription(
      `${client.i18n.get(language, "music", "play_playlist", {
        title: playlist.name,
        url: playlist.url!,
        duration: playlist.formattedDuration,
        songs: String(queue.songs.length),
        request: String(playlist.user),
      })}`,
    )
    .setColor(client.color);

  if (msg) await msg!.edit({ content: " ", embeds: [embed] });
  await client.queue_message.delete(String(playlist.user?.id));
};
