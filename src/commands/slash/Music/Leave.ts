import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["leave"],
  description: "Make the bot leave the voice channel.",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "leave_loading")}`,
    );
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

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

    await client.manager.voices.leave(interaction.guild!);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "leave_msg", {
          channel: channel.name,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
