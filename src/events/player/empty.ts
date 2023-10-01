import { EmbedBuilder } from "discord.js";
import { Manager } from "../../manager.js";
import { Queue } from "distube";

export default async (client: Manager, queue: Queue) => {
  await client.UpdateMusic(queue);

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
    .setDescription(`${client.i18n.get("player", "player_empty", language)}`);

  queue.textChannel!.send({ embeds: [embed] });
};
