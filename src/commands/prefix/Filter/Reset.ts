import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "reset",
  description: "Reset filter",
  category: "Filter",
  usage: "",
  aliases: [],

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
          .setDescription(
            `${client.i18n.get(language, "filters", "reset_loading")}`,
          )
          .setColor(client.color),
      ],
    });

    const player = client.manager.getQueue(message.guild!);
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

    player.filters.clear();
    player.setVolume(100);

    const resetted = new EmbedBuilder()
      .setDescription(`${client.i18n.get(language, "filters", "reset_on")}`)
      .setColor(client.color);

    await delay(2000);
    msg.edit({ content: " ", embeds: [resetted] });
  },
};
