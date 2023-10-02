import {
  EmbedBuilder,
  CommandInteraction,
  GuildMember,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { RepeatMode } from "distube";

export default {
  name: ["loop"],
  description: "Loop song in queue type all/current!",
  category: "Music",
  options: [
    {
      name: "type",
      description: "Type of loop",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: "Current",
          value: "current",
        },
        {
          name: "Queue",
          value: "queue",
        },
        {
          name: "Disable",
          value: "disable",
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
    const msg = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "loading")}`)
          .setColor(client.color),
      ],
    });

    const player = client.manager.getQueue(interaction.guild!);
    if (!player)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`,
            )
            .setColor(client.color),
        ],
      });
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`,
            )
            .setColor(client.color),
        ],
      });

    const mode = (interaction.options as CommandInteractionOptionResolver).get(
      "type",
    )!.value;

    if (mode == "current") {
      await player.setRepeatMode(RepeatMode.SONG);
      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_current")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });
    } else if (mode == "queue") {
      await player.setRepeatMode(RepeatMode.QUEUE);
      const looped_queue = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped_queue] });
    } else if (mode == "disable") {
      await player.setRepeatMode(RepeatMode.DISABLED);
      const looped = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "music", "unloop_current")}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });
    }
  },
};
