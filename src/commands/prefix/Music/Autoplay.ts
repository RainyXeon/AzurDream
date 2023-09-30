import {
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
  VoiceBasedChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "autoplay",
  description: "Autoplay music (Random play songs)",
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
    const msg = await message.channel.send(
      `${client.i18n.get(language, "music", "autoplay_loading")}`,
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

    if (player.autoplay == true) {
      client.manager.toggleAutoplay(message);

      await player.songs.splice(1, player.songs.length);

      const off = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_off")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [off] });
    } else {
      const identifier = player.songs[0].id;
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      const res = await client.manager.search(search);

      client.manager.toggleAutoplay(message);

      await client.manager.play(
        message.member!.voice.channel as VoiceBasedChannel,
        res[1],
        {
          member: message.member as GuildMember,
          textChannel: message.channel as TextChannel,
          message,
        },
      );

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_on")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [on] });
    }
  },
};
