import { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "remove",
  description: "Remove song from queue.",
  category: "Music",
  usage: "<position>",
  aliases: ["rm"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "pause_loading")}`
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

    const tracks = args[0];
    if (tracks && isNaN(+tracks))
      return msg.edit(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );
    if (Number(tracks) == 0)
      return msg.edit(
        `${client.i18n.get(language, "music", "removetrack_already")}`
      );
    if (Number(tracks) > player.songs.length)
      return msg.edit(
        `${client.i18n.get(language, "music", "removetrack_notfound")}`
      );

    const song = player.songs[Number(tracks) - 1];

    player.songs.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_desc", {
          name: String(song.name),
          url: song.url,
          duration: convertTime(player.currentTime),
          request: String(song.member),
        })}`
      )
      .setColor(client.color);

    return msg.edit({ embeds: [embed] });
  },
};
