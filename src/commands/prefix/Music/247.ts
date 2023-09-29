import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: "247",
  description: "24/7 in voice channel",
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
      `${client.i18n.get(language, "music", "247_loading")}`
    );

    const player = client.manager.getQueue(message.guild!)
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);

    const { channel } = message.member!.voice;
    if (
      !channel ||
      message.member!.voice.channel !== message.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    let data = await client.db.get(`autoreconnect.guild_${message.guild!.id}`);

    if (data) {
      await client.db.delete(`autoreconnect.guild_${message.guild!.id}`);
      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_off")}`)
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [on] });
    } else if (!data) {
      await client.db.set(`autoreconnect.guild_${message.guild!.id}`, {
        guild: message.guild!.id,
        text: player.textChannel?.id,
        voice: player.voiceChannel?.id,
      });

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "247_on")}`)
        .setColor(client.color);
      return msg.edit({ content: " ", embeds: [on] });
    }
  },
};
