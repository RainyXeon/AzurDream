import { Queue } from "distube";
import { Manager } from "../../manager.js";
import { BaseGuildTextChannel, EmbedBuilder } from "discord.js";

export default async (
  client: Manager,
  channel: BaseGuildTextChannel,
  error: Error,
) => {
  let guildModel = await client.db.get(`language.guild_${channel.guild.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${channel.guild.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  channel.send({
    embeds: [
      new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "error", "player_error")}`)
        .setColor(client.color),
    ],
  });

  const embed = new EmbedBuilder()
    .setDescription(`${error}`)
    .setColor(client.color);

  channel.send({ embeds: [embed] });
  client.logger.log({ level: "error", message: error });
};
