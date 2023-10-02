import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["join"],
  description: "Make the bot join the voice channel.",
  category: "Music",
  lavalink: true,
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

    const queue = client.manager.getQueue(interaction.guild!);
    if (queue)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "already_playing")}`,
            )
            .setColor(client.color),
        ],
      });

    await client.manager.voices.join(
      (interaction.member as GuildMember)!.voice!.channel!,
    );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "join_msg", {
          channel: channel.name,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
