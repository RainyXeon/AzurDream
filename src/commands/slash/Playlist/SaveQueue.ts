import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  GuildMember,
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Manager } from "../../../manager.js";
import { Song } from "distube";

const TrackAdd: Song[] = [];
const TrackExist: string[] = [];
let Result: Song[] | null = null;

export default {
  name: ["playlist", "save", "queue"],
  description: "Save the current queue to a playlist",
  category: "Playlist",
  options: [
    {
      name: "name",
      description: "The name of the playlist",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const value = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("name");
    const Plist = value!.replace(/_/g, " ");
    const fullList = await client.db.get("playlist");

    const pid = Object.keys(fullList).filter(function (key) {
      return (
        fullList[key].owner == interaction.user.id &&
        fullList[key].name == Plist
      );
    });

    const playlist = fullList[pid[0]];

    if (!playlist)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_notfound")}`,
            )
            .setColor(client.color),
        ],
      });
    if (playlist.owner !== interaction.user.id)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "playlist", "savequeue_owner")}`,
            )
            .setColor(client.color),
        ],
      });

    const player = client.manager.getQueue(interaction.guild!.id);
    if (!player)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_player")}`,
            )
            .setColor(client.color),
        ],
      });

    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`,
            )
            .setColor(client.color),
        ],
      });

    const queue = player.songs.map((track) => track);

    TrackAdd.push(...queue);

    if (!playlist && playlist.tracks.length === 0) Result = TrackAdd;

    if (playlist.tracks) {
      for (let i = 0; i < playlist.tracks.length; i++) {
        const element = playlist.tracks[i].uri;
        TrackExist.push(element);
      }
      Result = TrackAdd.filter((track) => !TrackExist.includes(track.url));
    }

    if (Result!.length == 0) {
      const embed = new EmbedBuilder()
        .setDescription(
          `${client.i18n.get(language, "playlist", "savequeue_no_new_saved", {
            name: Plist,
          })}`,
        )
        .setColor(client.color);
      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "playlist", "savequeue_saved", {
          name: Plist,
          tracks: String(Result!.length),
        })}`,
      )
      .setColor(client.color);
    await interaction.editReply({ embeds: [embed] });

    Result!.forEach(async (track) => {
      await client.db.push(`playlist.${pid[0]}.tracks`, {
        title: track.name,
        uri: track.url,
        length: track.duration,
        thumbnail: track.thumbnail,
        author: track.uploader,
        requester: track.member, // Just case can push
      });
    });

    TrackAdd.length = 0;
    TrackExist.length = 0;
    Result = null;
  },
};
