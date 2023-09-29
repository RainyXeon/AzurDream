import { Manager } from "../../../manager.js";
import {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  Message,
} from "discord.js";
import FormatDuration from "../../../structures/FormatDuration.js";
import { QueueDuration } from "../../../structures/QueueDuration.js";

// Main code
export default {
  name: "nowplaying",
  description: "Display the song currently playing.",
  category: "Music",
  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const realtime = client.config.lavalink.NP_REALTIME;
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "np_loading")}`
    );
    const player = client.manager.getQueue(message.guild!);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);

    const song = player.songs[0];
    const position = player.currentTime;
    const CurrentDuration = FormatDuration(position);
    const TotalDuration = FormatDuration(song!.duration);
    const Thumbnail =
      `https://img.youtube.com/vi/${song!.id}/maxresdefault.jpg` ||
      `https://cdn.discordapp.com/avatars/${client.user!.id}/${
        client.user!.avatar
      }.jpeg`;
    const Part = Math.floor((position / song!.duration!) * 30);
    const Emoji = player.playing ? "🔴 |" : "⏸ |";

    const embeded = new EmbedBuilder()
      .setAuthor({
        name: player.playing
          ? `${client.i18n.get(language, "music", "np_title")}`
          : `${client.i18n.get(language, "music", "np_title_pause")}`,
        iconURL: `${client.i18n.get(language, "music", "np_icon")}`,
      })
      .setColor(client.color)
      .setDescription(`**[${song!.name}](${song!.url})**`)
      .setThumbnail(Thumbnail)
      .addFields([
        {
          name: `${client.i18n.get(language, "player", "author_title")}`,
          value: `${song!.uploader}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "request_title")}`,
          value: `${song!.member}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "volume_title")}`,
          value: `${player.volume}%`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "queue_title")}`,
          value: `${player.songs.length}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "duration_title")}`,
          value: `${FormatDuration(song!.duration)}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(
            language,
            "player",
            "total_duration_title"
          )}`,
          value: `${FormatDuration(QueueDuration(player))}`,
          inline: true,
        },
        {
          name: `${client.i18n.get(language, "player", "download_title")}`,
          value: `**[${
            song!.name
          } - y2mate.com](https://www.y2mate.com/youtube/${
            song!.id
          })**`,
          inline: false,
        },
        {
          name: `${client.i18n.get(language, "music", "np_current_duration", {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`${Emoji} ${
            "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
          }\`\`\``,
          inline: false,
        },
      ])
      .setTimestamp();

    const NEmbed = await msg.edit({ content: " ", embeds: [embeded] });
    var interval = null;

    if (realtime === "true") {
      interval = setInterval(async () => {
        if (!player.playing) return;
        const CurrentDuration = FormatDuration(position);
        const Part = Math.floor((position / song!.duration!) * 30);
        const Emoji = player.playing ? "🔴 |" : "⏸ |";

        (embeded as any).fields[6] = {
          name: `${client.i18n.get(language, "music", "np_current_duration", {
            current_duration: CurrentDuration,
            total_duration: TotalDuration,
          })}`,
          value: `\`\`\`${Emoji} ${
            "─".repeat(Part) + "🎶" + "─".repeat(30 - Part)
          }\`\`\``,
        };

        if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
      }, 5000);
    } else if (realtime === "false") {
      if (!player.playing) return;
      if (NEmbed) NEmbed.edit({ content: " ", embeds: [embeded] });
    }
  },
};
