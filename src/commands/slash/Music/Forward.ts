import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const fastForwardNum = 10;

// Main code
export default {
  name: ["forward"],
  description: "Forward timestamp in the song!",
  category: "Music",
  options: [
    {
      name: "seconds",
      description: "The number of seconds to forward the timestamp by.",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getNumber("seconds");
    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "forward_loading")}`,
    );

    const player = client.manager.getQueue(interaction.guild!);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const song = player.songs[0];
    const song_position = player.currentTime;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(value)) {
      if (song_position + value < song!.duration!) {
        player.seek(song_position + value);

        const forward1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward1] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`,
        );
      }
    } else if (value && isNaN(value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "forward_invalid", {
          prefix: "/",
        })}`,
      );
    }

    if (!value) {
      if (song_position + fastForwardNum < song!.duration!) {
        player.seek(song_position + fastForwardNum);

        const forward2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`,
        );
      }
    }
  },
};
