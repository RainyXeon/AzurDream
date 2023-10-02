import { CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["previous"],
  description: "Play the previous song in the queue.",
  category: "Music",
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
    if (!player.previousSongs)
      return msg.edit(
        `${client.i18n.get(language, "music", "previous_notfound")}`,
      );

    await player.previous();

    const embed = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "music", "previous_msg")}`)
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
