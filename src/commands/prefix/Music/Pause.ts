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

    await player.pause();

    if (client.websocket)
      await client.websocket.send(
        JSON.stringify({
          op: "pause_track",
          guild: message.guild!.id,
        })
      );

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "pause_msg", {
          pause: `${client.i18n.get(language, "music", "pause_switch_pause")}`,
        })}`
      )
      .setColor(client.color);

    msg.edit({ content: " ", embeds: [embed] });
  },
};
