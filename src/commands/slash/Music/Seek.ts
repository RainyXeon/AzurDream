import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/;

// Main code
export default {
  name: ["seek"],
  description: "Seek timestamp in the song!",
  category: "Music",
  options: [
    {
      name: "time",
      description:
        "Set the position of the playing track. Example: 0:10 or 120:10",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });
    let value;
    const time = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("time");

    console.log(time_regex.test(time!), time!.split(/:/));
    if (!time_regex.test(time!))
      return interaction.editReply(
        `${client.i18n.get(language, "music", "seek_invalid")}`,
      );
    else {
      const [m, s] = time!.split(/:/);
      const min = Number(m) * 60;
      const sec = Number(s);
      value = min + sec;
      console.log(value);
    }

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

    if (value >= player.songs[0]!.duration! || value < 0)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "seek_beyond")}`)
          .setColor(client.color)
        ]
      });
    await player.seek(value);

    const song_position = player.currentTime;

    let final_res;

    if (song_position < value) final_res = song_position + value;
    else final_res = value;

    await player.seek(final_res);

    const Duration = formatDuration(final_res);

    const seeked = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "seek_msg", {
          duration: Duration,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [seeked] });
  },
};
