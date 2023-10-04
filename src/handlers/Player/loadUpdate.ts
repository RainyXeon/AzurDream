import { Manager } from "../../manager.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import formatDuration from "../../structures/FormatDuration.js";
import { QueueDuration } from "../../structures/QueueDuration.js";
import { Queue } from "distube";

export default async (client: Manager) => {
  client.UpdateQueueMsg = async function (player: Queue) {
    let data = await client.db.get(`setup.guild_${player.id!}`);
    if (!data) return;
    if (data.enable === false) return;

    let channel = (await client.channels.cache.get(
      data.channel,
    )) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(data.playmsg);
    if (!playMsg) return;

    let guildModel = await client.db.get(`language.guild_${player.id!}`);
    if (!guildModel) {
      guildModel = await client.db.set(
        `language.guild_${player.id!}`,
        client.config.bot.LANGUAGE,
      );
    }

    const language = guildModel;

    const songStrings = [];
    const queuedSongs = player.songs.map(
      (song, i) =>
        `${client.i18n.get(language, "setup", "setup_content_queue", {
          index: `${i + 1}`,
          title: song.name ? String(song.name!) : "Unnamed",
          duration: formatDuration(song.duration),
          request: `${song.member}`,
        })}`,
    );

    const current_song = `${client.i18n.get(
      language,
      "setup",
      "setup_content_queue",
      {
        index: `${1}`,
        title: String(player.songs[0].name),
        duration: formatDuration(player.songs[0].duration),
        request: `${player.songs[0].member}`,
      },
    )}`;

    await songStrings.push(...queuedSongs);

    const Str = songStrings.slice(0, 10).join("\n");

    const TotalDuration = QueueDuration(player);

    let cSong = player.songs[0];
    let qDuration = `${formatDuration(TotalDuration)}`;

    let embed = new EmbedBuilder()
      .setAuthor({
        name: `${client.i18n.get(language, "setup", "setup_author")}`,
        iconURL: `${client.i18n.get(language, "setup", "setup_author_icon")}`,
      })
      .setDescription(
        `${client.i18n.get(language, "setup", "setup_desc", {
          title: String(cSong!.name),
          url: cSong!.url,
          duration: formatDuration(cSong!.duration),
          request: `${cSong!.member}`,
        })}`,
      ) // [${cSong.title}](${cSong.uri}) \`[${formatDuration(cSong.duration)}]\` • ${cSong.requester}
      .setColor(client.color)
      .setImage(
        `${
          cSong!.thumbnail
            ? cSong!.thumbnail
            : `https://cdn.discordapp.com/avatars/${client.user!.id}/${
                client.user!.avatar
              }.jpeg?size=300`
        }`,
      )
      .setFooter({
        text: `${client.i18n.get(language, "setup", "setup_footer", {
          songs: `${player.songs.length}`,
          volume: `${player.volume}`,
          duration: qDuration,
        })}`,
      }); //${player.queue.length} • Song's in Queue | Volume • ${player.volume}% | ${qDuration} • Total Duration

    return await playMsg
      .edit({
        content: `${client.i18n.get(language, "setup", "setup_content")}\n${
          Str == ""
            ? `${client.i18n.get(language, "setup", "setup_content_empty")}`
            : "\n" + Str
        }`,
        embeds: [embed],
        components: [client.enSwitch],
      })
      .catch((e) => {});
  };

  /**
   *
   * @param {Player} player
   */
  client.UpdateMusic = async function (player: Queue) {
    let data = await client.db.get(`setup.guild_${player.id!}`);
    if (!data) return;
    if (data.enable === false) return;

    let channel = (await client.channels.cache.get(
      data.channel,
    )) as TextChannel;
    if (!channel) return;

    let playMsg = await channel.messages.fetch(data.playmsg);
    if (!playMsg) return;

    let guildModel = await client.db.get(`language.guild_${player.id!}`);
    if (!guildModel) {
      guildModel = await client.db.set(
        `language.guild_${player.id!}`,
        client.config.bot.LANGUAGE,
      );
    }

    const language = guildModel;

    const queueMsg = `${client.i18n.get(language, "setup", "setup_queuemsg")}`;

    const playEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({
        name: `${client.i18n.get(language, "setup", "setup_playembed_author")}`,
      })
      .setImage(
        `https://cdn.discordapp.com/avatars/${client.user!.id}/${
          client.user!.avatar
        }.jpeg?size=300`,
      )
      .setDescription(
        `${client.i18n.get(language, "setup", "setup_playembed_desc", {
          clientId: client.user!.id,
        })}`,
      )
      .setFooter({
        text: `${client.i18n.get(language, "setup", "setup_playembed_footer")}`,
      });

    return await playMsg
      .edit({
        content: `${queueMsg}`,
        embeds: [playEmbed],
        components: [client.diSwitch],
      })
      .catch((e) => {});
  };
};
