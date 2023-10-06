import { Queue, Song } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue, song: Song) => {
  const channel_id = await client.queue_message.get(String(song.user?.id));
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;

  const msg = await queue.textChannel!.messages.cache.get(channel_id?.message!);

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
      `${client.i18n.get(language, "music", "play_track", {
        title: song.name!,
        url: song.url,
        duration: song.formattedDuration!,
        request: String(song.member),
      })}`,
    )
    .setColor(client.color);

  if (msg) await msg!.edit({ content: " ", embeds: [embed] });

  await client.queue_message.delete(String(song.user?.id));
};
