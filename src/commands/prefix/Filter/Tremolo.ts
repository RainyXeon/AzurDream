import { EmbedBuilder, Message } from "discord.js";
import delay from "delay";
import { Manager } from "../../../manager.js";

export default {
  name: "tremolo",
  description: "Turning on tremolo filter!",
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
            `${client.i18n.get(language, "filters", "filter_loading", {
              name: "tremolo",
            })}`,
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

    await player.filters.add("tremolo");

    const earrapped = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "filters", "filter_on", {
          name: "tremolo",
        })}`,
      )
      .setColor(client.color);

    await delay(2000);
    msg.edit({ content: " ", embeds: [earrapped] });
  },
};
