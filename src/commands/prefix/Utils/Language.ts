import { Message } from "discord.js";
import { Manager } from "../../../manager.js";

import { EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
  name: "language",
  aliases: ["setlang", "lang"],
  usage: "<language>",
  category: "Utils",
  description: "Change the language for the bot",
  accessableby: "Members",

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const languages = client.i18n.getLocales();
    if (!message.member!.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "lang_perm")}`,
            )
            .setColor(client.color),
        ],
      });
    if (!args[0])
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "provide_lang", {
                languages: languages.join(", "),
              })}`,
            )
            .setColor(client.color),
        ],
      });
    if (!languages.includes(args[0]))
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "utilities", "provide_lang", {
                languages: languages.join(", "),
              })}`,
            )
            .setColor(client.color),
        ],
      });

    const newLang = await client.db.get(`language.guild_${message.guild!.id}`);
    if (!newLang) {
      await client.db.set(`language.guild_${message.guild!.id}`, args[0]);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_set", {
            language: args[0],
          })}`,
        )
        .setColor(client.color);

      return message.channel.send({ embeds: [embed] });
    } else if (newLang) {
      await client.db.set(`language.guild_${message.guild!.id}`, args[0]);
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "utilities", "lang_change", {
            language: args[0],
          })}`,
        )
        .setColor(client.color);

      return message.channel.send({ embeds: [embed] });
    }
  },
};
