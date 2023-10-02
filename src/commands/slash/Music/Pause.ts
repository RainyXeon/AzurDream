import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["pause"],
  description: "Pause the music!",
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
    await player.pause();
    const uni = `${client.i18n.get(language, "music", "pause_switch_pause")}`;
    if (client.websocket)
      await client.websocket.send(
        JSON.stringify({
          op: "pause",
          guild: interaction.guild!.id,
        }),
      );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "pause_msg", {
          pause: uni,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
