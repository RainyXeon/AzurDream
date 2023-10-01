import { EmbedBuilder, CommandInteraction, GuildMember } from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

let OriginalQueueLength: null | number;

// Main code
export default {
  name: ["remove-duplicate"],
  description: "Remove duplicated song from queue",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const msg = await interaction.editReply(
      {
        embeds: [
          new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "247_loading")}`)
          .setColor(client.color)
        ]
      }
    );

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

    OriginalQueueLength = player.songs.length;

    for (let i = 0; i < player.songs.length; i++) {
      const element = player.songs[i];
      if (player.songs[0]!.url == element.url) {
        player.songs.splice(player.songs.indexOf(player.songs[0]), 1);
      }
    }

    const unique = [...new Map(player.songs.map((m) => [m.url, m])).values()];
    await player.songs.splice(1, player.songs.length);
    player.songs.push(...unique);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_duplicate_desc", {
          original: String(OriginalQueueLength),
          new: String(unique.length),
          removed: String(OriginalQueueLength - unique.length),
        })}`,
      )
      .setColor(client.color);

    await interaction.editReply({ embeds: [embed] });

    OriginalQueueLength = null;
    return;
  },
};
