import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionsBitField,
  ChannelType,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["settings", "setup"],
  description: "Setup channel song request",
  category: "Utils",
  options: [
    {
      name: "type",
      description: "Type of channel",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Create",
          value: "create",
        },
        {
          name: "Delete",
          value: "delete",
        },
      ],
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    if (
      !(interaction.member!.permissions as Readonly<PermissionsBitField>).has(
        PermissionsBitField.Flags.ManageGuild,
      )
    )
      return interaction.editReply(
        `${client.i18n.get(language, "utilities", "lang_perm")}`,
      );
    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type",
      ) === "create"
    ) {
      const parent = await interaction.guild!.channels.create({
        name: `${client.user!.username} Music Zone`,
        type: ChannelType.GuildCategory,
      });
      const textChannel = await interaction.guild!.channels.create({
        name: "song-request",
        type: ChannelType.GuildText,
        topic: `${client.i18n.get(language, "setup", "setup_topic")}`,
        parent: parent.id,
      });
      const queueMsg = `${client.i18n.get(
        language,
        "setup",
        "setup_queuemsg",
      )}`;

      const playEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({
          name: `${client.i18n.get(
            language,
            "setup",
            "setup_playembed_author",
          )}`,
        })
        .setImage(
          `https://cdn.discordapp.com/avatars/${client.user!.id}/${
            client.user!.avatar
          }.jpeg?size=300`,
        )
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_playembed_desc")}`,
        )
        .setFooter({
          text: `${client.i18n.get(
            language,
            "setup",
            "setup_playembed_footer",
          )}`,
        });

      const channel_msg = await textChannel.send({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [client.diSwitch],
      });

      const voiceChannel = await interaction.guild!.channels.create({
        name: `${client.user!.username} Music`,
        type: ChannelType.GuildVoice,
        parent: parent.id,
        userLimit: 30,
      });

      const new_data = {
        guild: interaction.guild!.id,
        enable: true,
        channel: textChannel.id,
        playmsg: channel_msg.id,
        voice: voiceChannel.id,
        category: parent.id,
      };

      await client.db.set(`setup.guild_${interaction.guild!.id}`, new_data);

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_msg", {
            channel: String(textChannel),
          })}`,
        )
        .setColor(client.color);
      return interaction.followUp({ embeds: [embed] });
    }

    if (
      (interaction.options as CommandInteractionOptionResolver).getString(
        "type",
      ) === "delete"
    ) {
      const SetupChannel = await client.db.get(
        `setup.guild_${interaction.guild!.id}`,
      );

      const embed_none = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(undefined),
          })}`,
        )
        .setColor(client.color);

      if (!SetupChannel) return interaction.editReply({ embeds: [embed_none] });

      const fetchedTextChannel = interaction.guild!.channels.cache.get(
        SetupChannel.channel,
      );
      const fetchedVoiceChannel = interaction.guild!.channels.cache.get(
        SetupChannel.voice,
      );
      const fetchedCategory = interaction.guild!.channels.cache.get(
        SetupChannel.category,
      );

      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "setup", "setup_deleted", {
            channel: String(fetchedTextChannel),
          })}`,
        )
        .setColor(client.color);

      if (fetchedCategory) await fetchedCategory.delete();
      if (fetchedVoiceChannel) await fetchedVoiceChannel.delete();
      if (fetchedTextChannel) await fetchedTextChannel.delete();

      const deleted_data = {
        guild: interaction.guild!.id,
        enable: false,
        channel: "",
        playmsg: "",
        voice: "",
        category: "",
      };

      await client.db.set(`setup.guild_${interaction.guild!.id}`, deleted_data);

      return interaction.editReply({ embeds: [embed] });
    }
  },
};
