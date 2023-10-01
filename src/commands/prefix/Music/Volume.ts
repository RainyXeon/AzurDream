import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "volume",
  description: "Adjusts the volume of the bot.",
  category: "Music",
  usage: "<number>",
  aliases: ["vol"],

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

    const value = args[0];
    if (value && isNaN(+value))
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "number_invalid")}`,
            )
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

    if (!value)
      return msg.edit(
        `${client.i18n.get(language, "music", "volume_usage", {
          volume: String(player.volume),
        })}`,
      );
    if (Number(value) <= 0 || Number(value) > 100)
      return msg.edit(
        `${client.i18n.get(language, "music", "volume_invalid")}`,
      );

    await player.setVolume(Number(value));

    const changevol = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "volume_msg", {
          volume: value,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [changevol] });
  },
};
