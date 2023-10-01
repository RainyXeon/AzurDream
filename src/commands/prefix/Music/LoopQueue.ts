import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import { RepeatMode } from "distube";

// Main code
export default {
  name: "loopall",
  description: "Loop all songs in queue!",
  category: "Music",
  usage: "",
  aliases: ["lq"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const msg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "loading")}`)
          .setColor(client.color),
      ],
    });

    const player = client.manager.getQueue(message.guild!.id);
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
    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
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

    if (player.repeatMode === RepeatMode.QUEUE) {
      await player.setRepeatMode(RepeatMode.DISABLED);

      const unloopall = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "unloopall")}`)
        .setColor(client.color);

      return msg.edit({ content: " ", embeds: [unloopall] });
    } else if (player.repeatMode === RepeatMode.DISABLED) {
      await player.setRepeatMode(RepeatMode.QUEUE);

      const loopall = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loopall")}`)
        .setColor(client.color);

      return msg.edit({ content: " ", embeds: [loopall] });
    }
  },
};
