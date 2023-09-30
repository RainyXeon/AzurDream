import { Manager } from "../../manager.js";
import {
  EmbedBuilder,
  TextChannel,
  Message,
  VoiceBasedChannel,
  GuildMember,
} from "discord.js";
import delay from "delay";
import { GlobalInteraction } from "../../types/Interaction.js";
import { RepeatMode } from "distube";

/**
 * @param {Client} client
 */
export default async (client: Manager) => {
  try {
    client.on(
      "interactionCreate",
      async (interaction: GlobalInteraction | any) => {
        if (!interaction.guild || interaction.user.bot) return;
        if (interaction.isButton()) {
          const { customId, member } = interaction;
          let voiceMember = interaction.guild.members.cache.get(member.id);
          let channel = voiceMember.voice.channel;

          let player = await client.manager.getQueue(interaction.guild);
          if (!player) return;

          const playChannel = client.channels.cache.get(
            player.textChannel?.id!,
          );
          if (!playChannel) return;

          let guildModel = await client.db.get(
            `language.guild_${player.textChannel?.id!}`,
          );
          if (!guildModel) {
            guildModel = await client.db.set(
              `language.guild_${player.textChannel?.id!}`,
              client.config.bot.LANGUAGE,
            );
          }

          const language = guildModel;

          switch (customId) {
            case "sprevious":
              {
                if (!channel) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (
                  interaction.guild.members.me.voice.channel &&
                  !interaction.guild.members.me.voice.channel.equals(channel)
                ) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (!player || !player.previousSongs[0]) {
                  return interaction.reply(
                    `${client.i18n.get(
                      language,
                      "music",
                      "previous_notfound",
                    )}`,
                  );
                } else {
                  await player.previous();

                  const embed = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "music", "previous_msg")}`,
                    )
                    .setColor(client.color);

                  interaction.reply({ embeds: [embed] });
                }
              }
              break;

            case "sskip":
              {
                if (!channel) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (
                  interaction.guild.members.me.voice.channel &&
                  !interaction.guild.members.me.voice.channel.equals(channel)
                ) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (!player) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_player")}`,
                  );
                } else {
                }
                if (player.songs.length == 0) {
                  await client.manager.voices.leave(interaction.guild);
                  await client.UpdateMusic(player);

                  const embed = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "music", "skip_msg")}`,
                    )
                    .setColor(client.color);

                  interaction.reply({ embeds: [embed] });
                } else {
                  await player.skip();

                  const embed = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "music", "skip_msg")}`,
                    )
                    .setColor(client.color);

                  interaction.reply({ embeds: [embed] });
                }
              }
              break;

            case "sstop":
              {
                if (!channel) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (
                  interaction.guild.members.me.voice.channel &&
                  !interaction.guild.members.me.voice.channel.equals(channel)
                ) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (!player) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_player")}`,
                  );
                } else {
                  await client.manager.voices.leave(interaction.guild);
                  await client.UpdateMusic(player);

                  const embed = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "player", "stop_msg")}`,
                    )
                    .setColor(client.color);

                  interaction.reply({ embeds: [embed] });
                }
              }
              break;

            case "spause":
              {
                if (!channel) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (
                  interaction.guild.members.me.voice.channel &&
                  !interaction.guild.members.me.voice.channel.equals(channel)
                ) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_voice")}`,
                  );
                } else if (!player) {
                  return interaction.reply(
                    `${client.i18n.get(language, "noplayer", "no_player")}`,
                  );
                } else {
                  await player.pause();
                  const uni = `${client.i18n.get(
                    language,
                    "player",
                    "switch_pause",
                  )}`;

                  const embed = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "player", "pause_msg", {
                        pause: uni,
                      })}`,
                    )
                    .setColor(client.color);

                  interaction.reply({ embeds: [embed] });
                }
              }
              break;

            case "sloop":
              {
                if (!player) {
                  return;
                }
                const loop_mode = {
                  none: "none",
                  track: "track",
                  queue: "queue",
                };

                if (player.repeatMode === RepeatMode.QUEUE) {
                  await player.setRepeatMode(RepeatMode.DISABLED);

                  const unloopall = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "music", "unloopall")}`,
                    )
                    .setColor(client.color);
                  return await interaction.reply({
                    content: " ",
                    embeds: [unloopall],
                  });
                } else if (
                  player.repeatMode === RepeatMode.SONG ||
                  player.repeatMode === RepeatMode.DISABLED
                ) {
                  await player.setRepeatMode(RepeatMode.QUEUE);
                  const loopall = new EmbedBuilder()
                    .setDescription(
                      `${client.i18n.get(language, "music", "loopall")}`,
                    )
                    .setColor(client.color);
                  return await interaction.reply({
                    content: " ",
                    embeds: [loopall],
                  });
                }
              }
              break;
            default:
              break;
          }
        }
      },
    );
  } catch (e) {
    console.log(e);
  }
  /**
   * @param {Client} client
   * @param {Message} message
   */

  client.on("messageCreate", async (message: Message | any) => {
    if (!message.guild || !message.guild.available) return;
    let database = await client.db.get(`setup.guild_${message.guild.id}`);
    let player = client.manager.getQueue(message.guild);

    if (!database)
      await client.db.set(`setup.guild_${message.guild.id}`, {
        enable: false,
        channel: "",
        playmsg: "",
        voice: "",
        category: "",
      });

    database = await client.db.get(`setup.guild_${message.guild.id}`);

    if (!database.enable) return;

    let channel = await message.guild.channels.cache.get(database.channel);
    if (!channel) return;

    if (database.channel != message.channel.id) return;

    let guildModel = await client.db.get(`language.guild_${message.guild.id}`);
    if (!guildModel) {
      guildModel = await client.db.set(
        `language.guild_${message.guild.id}`,
        "en",
      );
    }

    const language = guildModel;

    if (message.author.id === client.user!.id) {
      await delay(3000);
      message.delete();
    }

    if (message.author.bot) return;

    const song = message.cleanContent;
    if (!song) return;

    let voiceChannel = await message.member.voice.channel;
    if (!voiceChannel)
      return message.channel
        .send(`${client.i18n.get(language, "noplayer", "no_voice")}`)
        .then((msg: Message) => {
          setTimeout(() => {
            msg.delete();
          }, 4000);
        });

    let msg = await message.channel.messages.fetch(database.playmsg);

    await client.queue_message.set(message.author.id, msg.id);

    await message.delete();

    await client.manager.play(
      message.member!.voice.channel as VoiceBasedChannel,
      song,
      {
        member: message.member as GuildMember,
        textChannel: message.channel as TextChannel,
        message,
      },
    );
  });
};
