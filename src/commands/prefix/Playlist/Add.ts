import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Message,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";
import { Song } from "distube";
import yts from "yt-search";

const REGEX =
  /(?:https?:\/\/)?(:www|:music)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;
const SHORT_REGEX = /[?&]list=([^#?&]*)/;

type YTSearchType =
  | yts.PlaylistItem
  | yts.VideoMetadataResult
  | yts.VideoSearchResult;
const TrackAdd: YTSearchType[] = [];
let type = "none";

export default {
  name: "playlist-add",
  description: "Add song to a playlist",
  category: "Playlist",
  usage: "<playlist_name> <url_or_name>",
  aliases: ["pl-add"],

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0] ? args[0] : null;
    const url_value = args[1] ? args[1] : null;

    if (value == null || !value)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid")}`,
      );
    const input = args[1];

    const PlaylistName = value!.replace(/_/g, " ");

    const Inputed = input;

    if (!Inputed)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid_url")}`,
      );

    const msg = await message.channel.send(
      `${client.i18n.get(language, "playlist", "add_loading")}`,
    );

    let result = [];

    const playlist_info = SHORT_REGEX.exec(String(url_value));
    const video_info = REGEX.exec(String(url_value));

    if (playlist_info && !video_info) {
      const rex_id = SHORT_REGEX.exec(String(url_value));
      const res = (await yts({ listId: rex_id![1] })).videos;
      result.push(...res);
    } else if (video_info) {
      const rex_id = REGEX.exec(String(url_value));
      const res = await yts({ videoId: rex_id![2] });
      result.push(res);
    } else {
      const res = (await yts(String(url_value))).videos[0];
      result.push(res);
    }

    const tracks = result;

    if (!tracks.length)
      return msg.edit({
        content: `${client.i18n.get(language, "music", "add_match")}`,
      });
    if (tracks.length > 1) for (let track of tracks) TrackAdd.push(track);
    else TrackAdd.push(tracks[0]);

    const Duration = convertTime(tracks[0].duration.seconds);

    function StartQueueDuration(tracks: YTSearchType[]) {
      const current = tracks[0].duration.seconds ?? 0;
      return tracks.reduce(
        (acc, cur) => acc + (cur.duration.seconds || 0),
        current,
      );
    }

    const TotalDuration = StartQueueDuration(tracks);

    if (playlist_info !== null) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_playlist", {
            title: tracks[0].title,
            url: Inputed,
            duration: convertTime(TotalDuration),
            track: String(tracks.length),
            user: String(message.author),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (video_info !== null) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_track", {
            title: tracks[0].title,
            url: `https://www.youtube.com/watch?v=${tracks[0].videoId}`,
            duration: Duration,
            user: String(message.author),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else if (!video_info && !playlist_info && result) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "add_search", {
            title: tracks[0].title,
            url: `https://www.youtube.com/watch?v=${tracks[0].videoId}`,
            duration: Duration,
            user: String(message.author),
          })}`,
        )
        .setColor(client.color);
      msg.edit({ content: " ", embeds: [embed] });
    } else {
      //The playlist link is invalid.
      return msg.edit(`${client.i18n.get(language, "playlist", "add_match")}`);
    }

    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == message.author.id &&
        fullList[key].name == PlaylistName
      );
    });

    const playlist = fullList[pid[0]];

    if (playlist == null || !playlist)
      return message.channel.send(
        `${client.i18n.get(language, "playlist", "invalid")}`,
      );

    if (playlist.owner !== message.author.id) {
      message.channel.send(
        `${client.i18n.get(language, "playlist", "add_owner")}`,
      );
      TrackAdd.length = 0;
      return;
    }
    const LimitTrack = playlist.tracks.length + TrackAdd.length;

    if (LimitTrack > client.config.bot.LIMIT_TRACK) {
      message.channel.send(
        `${client.i18n.get(language, "playlist", "add_limit_track", {
          limit: client.config.bot.LIMIT_TRACK,
        })}`,
      );
      TrackAdd.length = 0;
      return;
    }

    TrackAdd.forEach(async (track) => {
      await client.db.push(`playlist.${pid[0]}.tracks`, {
        title: track.title,
        uri: `https://www.youtube.com/watch?v=${tracks[0].videoId}`,
        length: track.duration.seconds,
        thumbnail: track.thumbnail,
        author: track.author.name,
        requester: message.author!.id, // Just case can push
      });
    });

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "add_added", {
          count: String(TrackAdd.length),
          playlist: PlaylistName,
        })}`,
      )
      .setColor(client.color);

    message.channel.send({ content: " ", embeds: [embed] });
    TrackAdd.length = 0;
  },
};
