import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  Message,
  VoiceBasedChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";
import { PlaylistInterface } from "../../../types/Playlist.js";
import { SearchResultType } from "distube";
let playlist: PlaylistInterface | null;

export default {
  name: "playlist-import",
  description: "Import a playlist to queue.",
  category: "Playlist",
  usage: "<playlist_name>",
  aliases: ["pl-import"],
  lavalink: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0] ? args[0] : null;

    if (value == null)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid")}`,
      );

    const { channel } = message.member!.voice;
    if (!channel)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "import_voice")}`,
      );
    if (
      !message
        .guild!.members.cache!.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Connect)
    )
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "import_join")}`,
      );
    if (
      !message
        .guild!.members.cache!.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Speak)
    )
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "import_speak")}`,
      );

    const queue = client.manager.getQueue(message);
    if (queue)
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "already_playing")}`,
            )
            .setColor(client.color),
        ],
      });

    await client.manager.voices.join(message.member!.voice.channel!);

    const SongAdd = [];
    let SongLoad = 0;

    const Plist = value.replace(/_/g, " ");

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id && fullList[key].name == Plist
      );
    });

    playlist = fullList[pid[0]];

    if (!playlist)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid")}`,
      );

    if (playlist.private && playlist.owner !== message.author.id) {
      message.channel.send(
        `${client.i18n.get(language, "playlist", "import_private")}`,
      );
      return;
    }

    const totalDuration = convertTime(
      playlist.tracks!.reduce((acc, cur) => acc + cur.length!, 0),
    );

    const msg = await message.channel.send(
      `${client.i18n.get(language, "playlist", "import_loading", {
        song_num: String(SongLoad),
      })}`,
    );

    for (let i = 0; i < playlist.tracks!.length; i++) {
      const res = await client.manager.search(playlist.tracks![i].uri, {
        type: SearchResultType.VIDEO,
        limit: 1,
      });
      SongAdd.push(res[0].url);
      SongLoad++;
      msg.edit(
        `${client.i18n.get(language, "playlist", "import_loading", {
          song_num: String(SongLoad),
        })}`,
      );
      if (SongLoad == playlist.tracks!.length) {
        const import_playlist = await client.manager.createCustomPlaylist(
          SongAdd,
        );

        await client.manager.play(
          message.member!.voice.channel as VoiceBasedChannel,
          import_playlist,
          {
            member: message.member as GuildMember,
            textChannel: message.channel as TextChannel,
            message,
          },
        );

        const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.author}
          .setDescription(
            `${client.i18n.get(language, "playlist", "import_imported", {
              name: playlist.name,
              tracks: String(playlist.tracks!.length),
              duration: totalDuration,
              user: String(message.author),
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [embed] });
      }
    }
  },
};
