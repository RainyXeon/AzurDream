import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["remove"],
  description: "Remove song from queue",
  category: "Music",
  options: [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
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
          .setDescription(
            `${client.i18n.get(language, "music", "247_loading")}`,
          )
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

    const tracks = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("position");
    if (tracks == 0)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_already")}`,
            )
            .setColor(client.color),
        ],
      });
    if (Number(tracks) > player.songs.length)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "removetrack_notfound")}`,
            )
            .setColor(client.color),
        ],
      });

    const song = player.songs[Number(tracks) - 1];

    player.songs.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_desc", {
          name: String(song.name),
          url: song.url,
          duration: convertTime(song.duration as number),
          request: String(song.member),
        })}`,
      )
      .setColor(client.color);

    return interaction.editReply({ embeds: [embed] });
  },
};
