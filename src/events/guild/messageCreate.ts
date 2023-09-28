import { ChannelType, Message } from "discord.js";
import { Manager } from "../../manager.js";
import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { stripIndents } from "common-tags";
import fs from "fs";

export default async (client: Manager, message: Message) => {
  if (message.author.bot || message.channel.type == ChannelType.DM) return;

  if (!client.is_db_connected)
    return client.logger.warn(
      "The database is not yet connected so this event will temporarily not execute. Please try again later!",
    );

  let guildModel = await client.db.get(`language.guild_${message.guild!.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${message.guild!.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  let PREFIX = client.prefix;

  const mention = new RegExp(`^<@!?${client.user!.id}>( |)$`);

  const GuildPrefix = await client.db.get(`prefix.guild_${message.guild!.id}`);
  if (GuildPrefix) PREFIX = GuildPrefix;
  else if (!GuildPrefix) {
    await client.db.set(`prefix.guild_${message.guild!.id}`, client.prefix);
    const newPrefix = await client.db.get(`prefix.guild_${message.guild!.id}`);
    PREFIX = newPrefix;
  }

  if (message.content.match(mention)) {
    const mention_embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "help", "wel", {
          bot: message.guild!.members.me!.displayName,
        })}`,
      })
      .setColor(client.color).setDescription(stripIndents`
        ${client.i18n.get(language, "help", "intro1", {
          bot: message.guild!.members.me!.displayName,
        })}
        ${client.i18n.get(language, "help", "intro2")}
        ${client.i18n.get(language, "help", "intro3")}
        ${client.i18n.get(language, "help", "prefix", {
          prefix: `\`${PREFIX}\``,
        })}
        ${client.i18n.get(language, "help", "intro4")}
        ${client.i18n.get(language, "help", "ver", {
          botver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
            .version,
        })}
        ${client.i18n.get(language, "help", "djs", {
          djsver: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
            .dependencies["discord.js"],
        })}
        ${client.i18n.get(language, "help", "codename", {
          codename: JSON.parse(await fs.readFileSync("package.json", "utf-8"))
            .name,
        })}
        ${client.i18n.get(language, "help", "lavalink", { aver: "v3.0-beta" })}
        ${client.i18n.get(language, "help", "help1", {
          help: `\`${PREFIX}help\` / \`/help\``,
        })}
        ${client.i18n.get(language, "help", "help2", {
          botinfo: `\`${PREFIX}status\` / \`/status\``,
        })}
        `);
    await message.channel.send({ embeds: [mention_embed] });
    return;
  }
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(
    `^(<@!?${client.user!.id}>|${escapeRegex(PREFIX)})\\s*`,
  );
  if (!prefixRegex.test(message.content)) return;
  const [matchedPrefix] = message.content.match(
    prefixRegex,
  ) as RegExpMatchArray;
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
  const cmd = args.shift()!.toLowerCase();

  const command =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  if (!command) return;

  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.SendMessages,
    )
  )
    return await message.author.dmChannel!.send(
      `${client.i18n.get(language, "interaction", "no_perms")}`,
    );
  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.ViewChannel,
    )
  )
    return;
  if (
    !message.guild!.members.me!.permissions.has(
      PermissionsBitField.Flags.EmbedLinks,
    )
  )
    return await message.channel.send(
      `${client.i18n.get(language, "interaction", "no_perms")}`,
    );

  if (command.owner && message.author.id != client.owner)
    return message.channel.send(
      `${client.i18n.get(language, "interaction", "owner_only")}`,
    );

  try {
    if (command.premium) {
      const user = client.premiums.get(message.author.id);
      if (!user || !user.isPremium) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${client.i18n.get(language, "nopremium", "premium_author")}`,
            iconURL: client.user!.displayAvatarURL(),
          })
          .setDescription(
            `${client.i18n.get(language, "nopremium", "premium_desc")}`,
          )
          .setColor(client.color)
          .setTimestamp();

        return message.channel.send({ content: " ", embeds: [embed] });
      }
    }
  } catch (err) {
    client.logger.error(err);
    return message.channel.send({
      content: `${client.i18n.get(language, "nopremium", "premium_error")}`,
    });
  }

  if (command) {
    try {
      command.run(client, message, args, language, PREFIX);
    } catch (error) {
      client.logger.error(error);
      message.channel.send({
        content: `${client.i18n.get(
          language,
          "interaction",
          "error",
        )}\n ${error}`,
      });
    }
  }
};
