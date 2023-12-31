import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const rewindNum = 10;

// Main code
export default {
  name: "rewind",
  description: "Rewind timestamp in the song!",
  category: "Music",
  usage: "<seconds>",
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
    const value = Number(args[0]);

    if (value && isNaN(+value))
      return msg.edit(
        `${client.i18n.get(language, "music", "number_invalid")}`,
      );

    const song_position = player.currentTime;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(value)) {
      if (song_position - value > 0) {
        await player.seek(song_position - value);

        const rewind1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind1] });
      } else {
        return msg.edit({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "rewind_beyond")}`,
              )
              .setColor(client.color),
          ],
        });
      }
    } else if (value && isNaN(value)) {
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "rewind_invalid", {
                prefix: "/",
              })}`,
            )
            .setColor(client.color),
        ],
      });
    }

    if (!value) {
      if (song_position - rewindNum > 0) {
        await player.seek(song_position - rewindNum);

        const rewind2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind2] });
      } else {
        return msg.edit(
          `${client.i18n.get(language, "music", "rewind_beyond")}`,
        );
      }
    }
  },
};
