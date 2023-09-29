import { EmbedBuilder, Message } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const fastForwardNum = 10;

// Main code
export default {
  name: "forward",
  description: "Forward timestamp in the song!",
  category: "Music",
  usage: "<seconds>",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const value = args[0];

    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "forward_loading")}`
    );

    const player = client.manager.getQueue(message.guild!);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const song = player.songs[0];
    const song_position = player.currentTime
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(+value)) {
      if (player.currentTime + Number(value) < song!.duration!) {
        player.seek(player.currentTime + Number(value))  

        const forward1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward1] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`
        );
      }
    } else if (value && isNaN(+value)) {
      return msg.edit(
        `${client.i18n.get(language, "music", "forward_invalid", {
          prefix: prefix,
        })}`
      );
    }

    if (!value) {
      if (song_position + fastForwardNum < song!.duration!) {
        player.seek(song_position + fastForwardNum)

        const forward2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "forward_msg", {
              duration: CurrentDuration,
            })}`
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [forward2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "forward_beyond")}`
        );
      }
    }
  },
};
