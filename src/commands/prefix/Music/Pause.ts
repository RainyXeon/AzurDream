import { Manager } from "../../../manager.js";
import { EmbedBuilder, Message } from "discord.js";

export default {
  name: "pause",
  description: "Pause the music!",
  category: "Music",
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

    await player.pause();

    if (client.websocket)
      await client.websocket.send(
        JSON.stringify({
          op: "pause_track",
          guild: message.guild!.id,
        }),
      );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "pause_msg", {
          pause: `${client.i18n.get(language, "music", "pause_switch_pause")}`,
        })}`,
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
