import {
  EmbedBuilder,
  Message,
  PermissionsBitField,
  VoiceBasedChannel,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";

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
