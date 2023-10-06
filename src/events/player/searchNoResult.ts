import { Queue, Song } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder, Message, TextChannel } from "discord.js";

export default async (client: Manager, message: Message, query: string) => {
  const channel_data = await client.queue_message.get(
    String(message.author.id),
  );
  const setup_channel = await client.db.get(`setup.guild_${message.guild!.id}`);

  if (channel_data?.channel === setup_channel.channel) return;

  const channel_msg = await client.channels!.cache.get(channel_data?.channel!);
  const msg = (channel_msg as TextChannel)!.messages.cache.get(
    channel_data?.message!,
  );

  let guildModel = await client.db.get(`language.guild_${message.guild!.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${message.guild!.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  const embed = new EmbedBuilder()
    .setDescription(`${client.i18n.get(language, "music", "play_match")}`)
    .setColor(client.color);

  if (msg) await msg!.edit({ content: " ", embeds: [embed] });

  await client.queue_message.delete(String(message.author?.id));
};
