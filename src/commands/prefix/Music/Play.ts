import {
  EmbedBuilder,
  Message,
  PermissionsBitField,
  VoiceBasedChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";
import yts from "yt-search";
import { SearchResultType } from "distube";

const REGEX =
  /(?:https?:\/\/)?(:www|:music)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;
const SHORT_REGEX = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;

export default {
  name: "play",
  description: "Play a song from any types",
  category: "Music",
  usage: "<name_or_url>",
  aliases: ["p", "pl", "pp"],
  lavalink: true,

  run: async (
    client: Manager,
    message: Message,
    args: string[],
    language: string,
    prefix: string,
  ) => {
    const value = args[0];
    const msg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "play_loading", {
              result: args[0],
            })}`,
          )
          .setColor(client.color),
      ],
    });

    await client.queue_message.set(message.author.id, {
      channel: message.channel.id,
      message: msg.id,
    });

    const { channel } = message.member!.voice;
    if (!channel)
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_invoice")}`,
            )
            .setColor(client.color),
        ],
      });
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Connect)
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_join")}`,
            )
            .setColor(client.color),
        ],
      });
    if (
      !message
        .guild!.members.cache.get(client.user!.id)!
        .permissions.has(PermissionsBitField.Flags.Speak)
    )
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "music", "play_speak")}`,
            )
            .setColor(client.color),
        ],
      });

    await client.manager.play(
      message.member!.voice.channel as VoiceBasedChannel,
      value,
      {
        member: message.member as GuildMember,
        textChannel: message.channel as TextChannel,
        message,
      },
    );

    await message.delete();
  },
};
