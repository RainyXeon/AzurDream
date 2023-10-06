import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Manager } from "../../manager.js";
import { Queue, Song, formatDuration } from "distube";

export default async (client: Manager, queue: Queue, track: Song) => {
  await client.UpdateQueueMsg(queue);
  const setup_channel = await client.db.get(`setup.guild_${queue.id}`);

  if (queue.textChannel?.id! === setup_channel.channel) return;

  let guildModel = await client.db.get(`language.guild_${queue.id}`);
  if (!guildModel) {
    guildModel = await client.db.set(
      `language.guild_${queue.id}`,
      client.config.bot.LANGUAGE,
    );
  }

  const language = guildModel;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `Starting Playing...`,
      iconURL: "https://cdn.discordapp.com/emojis/741605543046807626.gif",
    })
    .setThumbnail(String(track!.thumbnail))
    .setColor(client.color)
    .setDescription(`**[${track!.name}](${track.url})**`)
    .addFields([
      {
        name: `${client.i18n.get(language, "player", "author_title")}`,
        value: `**[${track.uploader.name}](${track.uploader.url})**`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "request_title")}`,
        value: `${track!.member}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "duration_title")}`,
        value: `${track.formattedDuration}`,
        inline: true,
      },
      {
        name: `${client.i18n.get(language, "player", "download_title")}`,
        value: `**[${
          track!.name
        } - y2mate.com](https://www.y2mate.com/youtube/${track!.id})**`,
        inline: false,
      },
    ])
    .setTimestamp();

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("pause")
        .setEmoji("⏯")
        .setStyle(ButtonStyle.Success),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("⬅")
        .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji("✖")
        .setStyle(ButtonStyle.Danger),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("skip")
        .setEmoji("➡")
        .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Success),
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("shuffle")
        .setEmoji(`🔀`)
        .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("voldown")
        .setEmoji(`🔉`)
        .setStyle(ButtonStyle.Success),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("clear")
        .setEmoji(`🗑`)
        .setStyle(ButtonStyle.Secondary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("volup")
        .setEmoji(`🔊`)
        .setStyle(ButtonStyle.Success),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId("queue")
        .setEmoji(`📋`)
        .setStyle(ButtonStyle.Primary),
    );

  const nowplay = await queue!.textChannel!.send({
    embeds: [embed],
    components: [row, row2],
  });

  const collector = nowplay.createMessageComponentCollector({
    filter: (message) => {
      if (
        message.guild.members.me!.voice.channel &&
        message.guild.members.me!.voice.channelId ===
          message.member.voice.channelId
      )
        return true;
      else {
        message.reply({
          content: `${client.i18n.get(language, "player", "join_voice")}`,
          ephemeral: true,
        });
        return false;
      }
    },
    time: track.duration * 1000,
  });

  collector.on("collect", async (message) => {
    const id = message.customId;
    const queue = client.manager.getQueue(message.guild.id);
    if (id === "pause") {
      if (!queue) {
        collector.stop();
      }
      if (queue!.paused) {
        await client.manager.resume(message.guild.id);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "player", "switch_resume")}`,
          );

        message.reply({ embeds: [embed], ephemeral: true });
      } else {
        await client.manager.pause(message.guild.id);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "player", "switch_pause")}`,
          );

        message.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (id === "skip") {
      if (!queue) {
        collector.stop();
      }
      if (queue!.songs.length === 1 && queue!.autoplay === false) {
        await client.manager.voices.leave(queue?.id!);
        return;
      } else {
        await client.manager.skip(message);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`${client.i18n.get(language, "player", "skip_msg")}`);

        nowplay.edit({ components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (id === "stop") {
      if (!queue) {
        collector.stop();
      }
      await client.manager.voices.leave(message.guild);
      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "stop_msg")}`)
        .setColor(client.color);

      await nowplay.edit({ components: [] });
      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "loop") {
      if (!queue) {
        collector.stop();
      }
      if (queue!.repeatMode === 0) {
        client.manager.setRepeatMode(message.guild.id, 1);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "music", "loop_current")}`,
          );

        message.reply({ embeds: [embed], ephemeral: true });
      } else {
        client.manager.setRepeatMode(message.guild.id, 0);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "music", "unloop_current")}`,
          );

        message.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (id === "previous") {
      if (!queue) {
        collector.stop();
      }
      if (queue!.previousSongs.length == 0) {
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "music", "previous_notfound")}`,
          );

        message.reply({ embeds: [embed], ephemeral: true });
      } else {
        await client.manager.previous(message);
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "music", "previous_msg")}`,
          );

        await nowplay.edit({ components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (id === "shuffle") {
      if (!queue) {
        collector.stop();
      }
      await client.manager.shuffle(message);
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription(
          `${client.i18n.get(language, "player", "shuffle_msg")}`,
        );

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "voldown") {
      if (!queue) {
        collector.stop();
      }
      await client.manager.setVolume(message, queue!.volume - 5);
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "player", "voldown_msg", {
          volume: `${queue!.volume}`,
        })}`,
      );

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "clear") {
      if (!queue) {
        collector.stop();
      }
      await queue!.songs.splice(1, queue!.songs.length);

      const embed = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "player", "clear_msg")}`)
        .setColor(client.color);

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "volup") {
      if (!queue) {
        collector.stop();
      }
      await client.manager.setVolume(message, queue!.volume + 5);
      const embed = new EmbedBuilder().setColor(client.color).setDescription(
        `${client.i18n.get(language, "player", "volup_msg", {
          volume: `${queue!.volume}`,
        })}`,
      );

      message.reply({ embeds: [embed], ephemeral: true });
    } else if (id === "queue") {
      if (!queue) {
        collector.stop();
      }
      const song = queue!.songs[0];
      const qduration = `${song.formattedDuration}`;
      const thumbnail = `https://img.youtube.com/vi/${
        song!.uploader
      }/hqdefault.jpg`;

      let pagesNum = Math.ceil(queue!.songs.length / 10);
      if (pagesNum === 0) pagesNum = 1;

      const songStrings = [];
      for (let i = 0; i < queue!.songs.length; i++) {
        const song = queue!.songs[i];
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
            name: `${client.i18n.get(language, "player", "queue_author", {
              guild: message.guild.name,
            })}`,
            iconURL: message.guild.iconURL()!,
          })
          .setThumbnail(thumbnail)
          .setColor(client.color)
          .setDescription(
            `${client.i18n.get(language, "player", "queue_description", {
              track: song!.name!,
              track_url: song!.url,
              duration: formatDuration(queue?.duration!),
              requester: `${song!.user}`,
              list_song: str == "" ? "  Nothing" : "\n" + str,
            })}`,
          )
          .setFooter({
            text: `${client.i18n.get(language, "player", "queue_footer", {
              page: `${i + 1}`,
              pages: `${pagesNum}`,
              queue_lang: `${queue!.songs.length}`,
              total_duration: qduration,
            })}`,
          });

        pages.push(embed);
      }
      message.reply({ embeds: [pages[0]], ephemeral: true });
    }
  });
  collector.on("end", async (collected, reason) => {
    if (reason === "time") {
      nowplay.edit({ components: [] });
    }
  });
};
