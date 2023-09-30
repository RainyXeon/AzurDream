import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import { Manager } from "../../../manager.js";
import { RepeatMode } from "distube";

export default {
  name: "loop",
  description: "Loop song in queue type all/current!",
  category: "Music",
  usage: "<mode>",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "loop_loading")}`,
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

    const mode_array = ["none", "track", "queue"];

    const mode = args[0];

    if (mode_array.includes(mode))
      return message.channel.send(
        `${client.i18n.get(language, "music", "loop_invalid", {
          mode: mode_array.join(", "),
        })}`,
      );

    const loop_mode = {
      none: "none",
      track: "track",
      queue: "queue",
    };

    if (mode == "current") {
      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_current")}`)
        .setColor(client.color);

      if (player.repeatMode == RepeatMode.SONG)
        return msg.edit({ content: " ", embeds: [looped] });
      await player.setRepeatMode(RepeatMode.SONG);
      msg.edit({ content: " ", embeds: [looped] });
    }

    if (mode == "queue") {
      const looped = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "unloop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped] });

      if (player.repeatMode == RepeatMode.DISABLED)
        return msg.edit({ content: " ", embeds: [looped] });
      await player.setRepeatMode(RepeatMode.DISABLED);
      msg.edit({ content: " ", embeds: [looped] });
    }

    if (mode == "none") {
      const looped_queue = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "loop_all")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [looped_queue] });

      if (player.repeatMode == RepeatMode.QUEUE)
        return msg.edit({ content: " ", embeds: [looped_queue] });
      await player.setRepeatMode(RepeatMode.QUEUE);
      msg.edit({ content: " ", embeds: [looped_queue] });
    }
  },
};
