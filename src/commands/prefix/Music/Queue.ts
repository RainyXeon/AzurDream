import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { NormalPage } from "../../../structures/PageQueue.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: "queue",
  description: "Show the queue of songs.",
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
    const value = Number(args[0]);

    if (value && isNaN(+value))
      return message.channel.send({
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
      return message.channel.send({
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
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`,
            )
            .setColor(client.color),
        ],
      });

    const song = player.songs[0];

    const qduration = `${formatDuration(player.duration)}`;
    const thumbnail = `https://img.youtube.com/vi/${song!.id}/hqdefault.jpg`;

    let pagesNum = Math.ceil(player.songs.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const songStrings = [];
    for (let i = 0; i < player.songs.length; i++) {
      const song = player.songs[i];
      songStrings.push(
        `**${i + 1}.** [${song.name}](${song.url}) \`[${formatDuration(
          song.duration,
        )}]\`
                    `,
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = songStrings.slice(i * 10, i * 10 + 10).join("");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "music", "queue_author", {
            guild: message.guild!.name,
          })}`,
          iconURL: message.guild!.iconURL() as string,
        })
        .setThumbnail(thumbnail)
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "music", "queue_description", {
            title: String(song!.name),
            url: String(song!.url),
            request: String(song!.member),
            duration: formatDuration(song!.duration),
            rest: str == "" ? "  Nothing" : "\n" + str,
          })}`,
        )
        .setFooter({
          text: `${client.i18n.get(language, "music", "queue_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            queue_lang: String(player.songs.length),
            duration: qduration,
          })}`,
        });

      pages.push(embed);
    }

    if (!value) {
      if (pages.length == pagesNum && player.songs.length > 10)
        NormalPage(
          client,
          message,
          pages,
          60000,
          player.songs.length,
          Number(qduration),
          language,
        );
      else return message.channel.send({ embeds: [pages[0]] });
    } else {
      if (isNaN(+value))
        return message.channel.send(
          `${client.i18n.get(language, "music", "queue_notnumber")}`,
        );
      if (Number(value) > pagesNum)
        return message.channel.send(
          `${client.i18n.get(language, "music", "queue_page_notfound", {
            page: String(pagesNum),
          })}`,
        );

      if (isNaN(value))
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_notnumber")}`,
              )
              .setColor(client.color),
          ],
        });
      if (value > pagesNum)
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `${client.i18n.get(language, "music", "queue_page_notfound", {
                  page: String(pagesNum),
                })}`,
              )
              .setColor(client.color),
          ],
        });
      const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
      return message.channel.send({ embeds: [pages[pageNum]] });
    }
  },
};
