import {
  EmbedBuilder,
  PermissionsBitField,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  TextChannel,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { PlaylistInterface } from "../../../types/Playlist.js";
import { Manager } from "../../../manager.js";
let playlist: PlaylistInterface | null;

export default {
  name: ["playlist", "import"],
  description: "Import a playlist to queue.",
  category: "Playlist",
  lavalink: true,
  options: [
    {
      name: "name",
      description: "The name of the playlist",
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "id",
      description: "The id of the playlist",
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
    const id = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("id");
    const { channel } = (interaction.member as GuildMember).voice;
    if (!channel)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "import_voice")}`,
      );
    if (
      !interaction
        .guild!.members.cache.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Connect)
    )
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "import_join")}`,
      );
    if (
      !interaction
        .guild!.members.cache.get(client.user!.id)!
        .permissionsIn(channel)
        .has(PermissionsBitField.Flags.Speak)
    )
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "import_speak")}`,
      );

    const SongAdd = [];
    let SongLoad = 0;

    if (id) playlist = await client.db.get(`playlist.pid_${id}`);
    if (value) {
      const Plist = value.replace(/_/g, " ");

      const fullList = await client.db.get("playlist");

      const pid = Object.keys(fullList).filter(function (key) {
        return (
          fullList[key].owner == interaction.user.id &&
          fullList[key].name == Plist
        );
      });

      playlist = fullList[pid[0]];
    }
    if (!id && !value)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "no_id_or_name")}`,
      );
    if (id && value)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "got_id_and_name")}`,
      );
    if (!playlist)
      return interaction.editReply(
        `${client.i18n.get(language, "playlist", "invalid")}`,
      );

    if (playlist.private && playlist.owner !== interaction.user.id) {
      interaction.editReply(
        `${client.i18n.get(language, "playlist", "import_private")}`,
      );
      return;
    }

    const totalDuration = convertTime(
      playlist.tracks!.reduce((acc, cur) => acc + cur.length!, 0),
    );

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "playlist", "import_loading", {
        song_num: String(SongLoad),
      })}`,
    );

    for (let i = 0; i < playlist.tracks!.length; i++) {
      SongAdd.push(playlist.tracks![i].uri);
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
          (interaction.member as GuildMember)!.voice!.channel!,
          import_playlist,
          {
            member: interaction.member as GuildMember,
            textChannel: interaction.channel as TextChannel,
          },
        );

        const embed = new EmbedBuilder() // **Imported • \`${Plist}\`** (${playlist.tracks.length} tracks) • ${message.author}
          .setDescription(
            `${client.i18n.get(language, "playlist", "import_imported", {
              name: playlist.name,
              tracks: String(playlist.tracks!.length),
              duration: totalDuration,
              user: String(interaction.user),
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [embed] });
      }
    }
  },
};
