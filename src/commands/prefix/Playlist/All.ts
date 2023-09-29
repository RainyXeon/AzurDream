import { EmbedBuilder, Message } from "discord.js";
import { NormalPlaylist } from "../../../structures/PageQueue.js";
import humanizeDuration from "humanize-duration";
import { Manager } from "../../../manager.js";
import { PlaylistInterface } from "../../../types/Playlist.js";

export default {
  name: "playlist-all",
  description: "View all your playlists",
  category: "Playlist",
  usage: "<number>",
  aliases: ["pl-all"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string
  ) => {
    const number = args[0] ? args[0] : null;
    if (number && isNaN(+number))
      return message.channel.send(
        `${client.i18n.get(language, "music", "number_invalid")}`
      );

    const playlists: PlaylistInterface[] = [];
    const fullList = await client.db.get("playlist");

    Object.keys(fullList)
      .filter(function (key) {
        return fullList[key].owner == message.author.id;
      })
      .forEach(async (key, index) => {
        playlists.push(fullList[key]);
      });

    let pagesNum = Math.ceil(playlists.length / 10);
    if (pagesNum === 0) pagesNum = 1;

    const playlistStrings = [];
    for (let i = 0; i < playlists.length; i++) {
      const playlist = playlists[i];
      const created = humanizeDuration(Date.now() - playlists[i].created, {
        largest: 1,
      });
      playlistStrings.push(
        `${client.i18n.get(language, "playlist", "view_embed_playlist", {
          num: String(i + 1),
          name: playlist.name,
          tracks: String(playlist.tracks!.length),
          create: created,
        })}
                `
      );
    }

    const pages = [];
    for (let i = 0; i < pagesNum; i++) {
      const str = playlistStrings.slice(i * 10, i * 10 + 10).join(`\n`);
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${client.i18n.get(language, "playlist", "view_embed_title", {
            user: message.author.username,
          })}`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(`${str == "" ? "  Nothing" : "\n" + str}`)
        .setColor(client.color)
        .setFooter({
          text: `${client.i18n.get(language, "playlist", "view_embed_footer", {
            page: String(i + 1),
            pages: String(pagesNum),
            songs: String(playlists.length),
          })}`,
        });

      pages.push(embed);
    }
    if (!number) {
      if (pages.length == pagesNum && playlists.length > 10) {
        NormalPlaylist(
          client,
          message,
          pages,
          30000,
          playlists.length,
          language
        );
        return (playlists.length = 0);
      } else {
        await message.channel.send({ embeds: [pages[0]] });
        return (playlists.length = 0);
      }
    } else {
      if (isNaN(+number))
        return message.channel.send({
          content: `${client.i18n.get(language, "playlist", "view_notnumber")}`,
        });
      if (Number(number) > pagesNum)
        return message.channel.send({
          content: `${client.i18n.get(
            language,
            "playlist",
            "view_page_notfound",
            {
              page: String(pagesNum),
            }
          )}`,
        });
      const pageNum = Number(number) == 0 ? 1 : Number(number) - 1;
      await message.channel.send({ embeds: [pages[pageNum]] });
      return (playlists.length = 0);
    }
  },
};
