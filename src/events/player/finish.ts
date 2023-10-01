import { Queue } from "distube";
import { Manager } from "../../manager.js";
import { EmbedBuilder } from "discord.js";

export default async (client: Manager, queue: Queue) => {
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;

  await client.UpdateMusic(queue);
  await client.manager.voices.leave(queue.textChannel!.guild);

  let guildModel = await client.db.get(`language.guild_${queue.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${queue.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  const embed = new EmbedBuilder()
    .setColor(client.color)
    .setDescription(`${client.i18n.get(language, "player", "queue_end_desc")}`);

  queue.textChannel!.send({ embeds: [embed] });
};
