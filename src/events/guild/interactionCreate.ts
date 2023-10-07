import {
  PermissionsBitField,
  InteractionType,
  CommandInteraction,
  EmbedBuilder,
  CommandInteractionOptionResolver,
  AutocompleteInteraction,
} from "discord.js";
import { Manager } from "../../manager.js";
import {
  AutocompleteInteractionChoices,
  GlobalInteraction,
  ManualInteraction,
} from "../../types/Interaction.js";
import yts from "yt-search";

/**
 * @param {GlobalInteraction} interaction
 */

const REGEX = [
  /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
  /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
  /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
  /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
  /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
  /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
  /^https?:\/\/(?:www\.|secure\.|sp\.)?nicovideo\.jp\/watch\/([a-z]{2}[0-9]+)/,
];

export default async (client: Manager, interaction: GlobalInteraction) => {
  if (
    interaction.isCommand() ||
    interaction.isContextMenuCommand() ||
    interaction.isModalSubmit() ||
    interaction.isChatInputCommand() ||
    interaction.isAutocomplete()
  ) {
    if (!interaction.guild || interaction.user.bot) return;

    if (!client.is_db_connected)
      return client.logger.warn(
        "The database is not yet connected so this event will temporarily not execute. Please try again later!",
      );

    let guildModel = await client.db.get(
      `language.guild_${interaction.guild.id}`,
    );
    if (!guildModel) {
      guildModel = await client.db.set(
        `language.guild_${interaction.guild.id}`,
        client.config.bot.LANGUAGE,
      );
    }

    const language = guildModel;

    let subCommandName = "";
    try {
      subCommandName = (
        (interaction as CommandInteraction)
          .options as CommandInteractionOptionResolver
      ).getSubcommand();
    } catch {}
    let subCommandGroupName = "";
    try {
      subCommandGroupName = (
        (interaction as CommandInteraction)
          .options as CommandInteractionOptionResolver
      ).getSubcommandGroup()!;
    } catch {}

    const command = client.slash.find((command) => {
      switch (command.name.length) {
        case 1:
          return (
            command.name[0] == (interaction as CommandInteraction).commandName
          );
        case 2:
          return (
            command.name[0] ==
              (interaction as CommandInteraction).commandName &&
            command.name[1] == subCommandName
          );
        case 3:
          return (
            command.name[0] ==
              (interaction as CommandInteraction).commandName &&
            command.name[1] == subCommandGroupName &&
            command.name[2] == subCommandName
          );
      }
    });

    // Push Function
    async function AutoCompletePush(
      url: string,
      choice: AutocompleteInteractionChoices[],
    ) {
      const Random =
        client.config.distube.DEFAULT[
          Math.floor(Math.random() * client.config.distube.DEFAULT.length)
        ];
      const match = REGEX.some((match) => {
        return match.test(url) == true;
      });
      if (match == true) {
        choice.push({ name: url, value: url });
        await (interaction as AutocompleteInteraction)
          .respond(choice)
          .catch(() => {});
      } else {
        const res = (await yts(url || Random)).videos
        for (let i = 0; i < 11; i++) {
          const result = res[i];
          choice.push({ name: result.title, value: result.url });
          
        }
        await (interaction as AutocompleteInteraction)
          .respond(choice)
          .catch(() => {});
      }
    }

    if (
      Number(interaction.type) == InteractionType.ApplicationCommandAutocomplete
    ) {
      if (
        (interaction as CommandInteraction).commandName == "play" ||
        (interaction as CommandInteraction).commandName + command.name[1] ==
          "playlist" + "add"
      ) {
        let choice: AutocompleteInteractionChoices[] = [];
        const url = (interaction as CommandInteraction).options.get(
          "search",
        )!.value;
        return AutoCompletePush(url as string, choice);
      } else if (
        (interaction as CommandInteraction).commandName + command.name[1] ==
        "playlist" + "edit"
      ) {
        let choice: AutocompleteInteractionChoices[] = [];
        const url = (interaction as CommandInteraction).options.get(
          "add",
        )!.value;
        return AutoCompletePush(url as string, choice);
      }
    }

    if (!command) return;

    const msg_cmd = [
      `[COMMAND] ${command.name[0]}`,
      `${command.name[1] || ""}`,
      `${command.name[2] || ""}`,
      `used by ${interaction.user.tag} from ${interaction.guild.name} (${interaction.guild.id})`,
    ];

    client.logger.info(`${msg_cmd.join(" ")}`);

    if (command.owner && interaction.user.id != client.owner)
      return (interaction as ManualInteraction).reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "owner_only")}`,
            )
            .setColor(client.color),
        ],
      });

    try {
      if (command.premium) {
        const user = client.premiums.get(interaction.user.id);
        if (!user || !user.isPremium) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${client.i18n.get(
                language,
                "nopremium",
                "premium_author",
              )}`,
              iconURL: client.user!.displayAvatarURL(),
            })
            .setDescription(
              `${client.i18n.get(language, "nopremium", "premium_desc")}`,
            )
            .setColor(client.color)
            .setTimestamp();

          return (interaction as ManualInteraction).reply({ content: " ", embeds: [embed] });
        }
      }
    } catch (err) {
      client.logger.error(err);
      return (interaction as ManualInteraction).reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "nopremium", "premium_error")}`,
            )
            .setColor(client.color),
        ],
      });
    }

    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.SendMessages,
      )
    )
      return interaction.user.dmChannel!.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "no_perms")}`,
            )
            .setColor(client.color),
        ],
      });
    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.ViewChannel,
      )
    )
      return;
    if (
      !interaction.guild.members.me!.permissions.has(
        PermissionsBitField.Flags.EmbedLinks,
      )
    )
      return (interaction as ManualInteraction).reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "interaction", "no_perms")}`,
            )
            .setColor(client.color),
        ],
      });
    if (!((interaction as CommandInteraction).commandName == "help")) {
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Speak,
        )
      )
        return (interaction as ManualInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`,
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.Connect,
        )
      )
        return (interaction as ManualInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`,
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.ManageMessages,
        )
      )
        return (interaction as ManualInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`,
              )
              .setColor(client.color),
          ],
        });
      if (
        !interaction.guild.members.me!.permissions.has(
          PermissionsBitField.Flags.ManageChannels,
        )
      )
        return await (interaction as ManualInteraction).reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "interaction", "no_perms")}`,
              )
              .setColor(client.color),
          ],
        });
    }

    if (!command) return;
    if (command) {
      try {
        command.run(interaction, client, language);
      } catch (error) {
        client.logger.log({
          level: "error",
          message: error,
        });
        return (interaction as ManualInteraction).editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(
                  language,
                  "interaction",
                  "error",
                )}\n ${error}`,
              )
              .setColor(client.color),
          ],
        });
      }
    }
  }
};
