import { EmbedBuilder, Message } from "discord.js";
import { Manager } from "../../../manager.js";
import axios from "axios";

// Main code
export default {
  name: "lyrics",
  description: "Display lyrics of a song.",
  category: "Music",
  usage: "<song_name>",
  aliases: [],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0];

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

    let song = value;
    let CurrentSong = player.songs[0];
    if (!song && CurrentSong)
      song = CurrentSong.name + " " + CurrentSong.uploader;

    let lyrics = null;

    const fetch_lyrics = await axios.get(
      `https://api.popcat.xyz/lyrics?song=${song!.replace(/ /g, "+")}`,
    );

    try {
      lyrics = fetch_lyrics.data.lyrics;
      if (!lyrics)
        return msg.edit(
          `${client.i18n.get(language, "music", "lyrics_notfound")}`,
        );
    } catch (err) {
      client.logger.log({ level: "error", message: err });
      return msg.edit(
        `${client.i18n.get(language, "music", "lyrics_notfound")}`,
      );
    }
    let lyricsEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(
        `${client.i18n.get(language, "music", "lyrics_title", {
          song: song,
        })}`,
      )
      .setDescription(`${lyrics}`)
      .setFooter({ text: `Requested by ${message.author.username}` })
      .setTimestamp();

    if (lyrics.length > 2048) {
      lyricsEmbed.setDescription(
        `${client.i18n.get(language, "music", "lyrics_toolong")}`,
      );
    }

    msg.edit({ content: " ", embeds: [lyricsEmbed] });
  },
};
