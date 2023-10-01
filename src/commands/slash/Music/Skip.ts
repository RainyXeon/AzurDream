import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["skip"],
  description: "Skips the song currently playing.",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "skip_loading")}`,
    );

    const player = client.manager.getQueue(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);
    const current = player.songs[0];

    if (player.songs.length == 0) {
      await client.manager.voices.leave(interaction.guild?.id!);
      await client.UpdateMusic(player);

      const skipped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [skipped] });
    } else {
      await player.skip();

      const skipped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "skip_msg")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [skipped] });
    }
  },
};
