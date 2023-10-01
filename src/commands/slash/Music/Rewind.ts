import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from "discord.js";
import formatDuration from "../../../structures/FormatDuration.js";
import { Manager } from "../../../manager.js";
const rewindNum = 10;

// Main code
export default {
  name: ["rewind"],
  description: "Rewind timestamp in the song!",
  category: "Music",
  options: [
    {
      name: "seconds",
      description: "Rewind timestamp in the song!",
      type: ApplicationCommandOptionType.Number,
      required: false,
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
    ).getNumber("seconds");

    const msg = await interaction.editReply(
      {
        embeds: [
          new EmbedBuilder()
          .setDescription(`${client.i18n.get(language, "music", "247_loading")}`)
          .setColor(client.color)
        ]
      }
    );

    const player = client.manager.getQueue(interaction.guild!);
    if (!player)
      return msg.edit({
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
      return msg.edit({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `${client.i18n.get(language, "noplayer", "no_voice")}`,
            )
            .setColor(client.color),
        ],
      });

    const song_position = player.currentTime;
    const CurrentDuration = formatDuration(song_position);

    if (value && !isNaN(value)) {
      if (song_position - value > 0) {
        await player.seek(song_position - value);

        const rewind1 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind1] });
      } else {
        return msg.edit(
          {
            embeds: [
              new EmbedBuilder()
              .setDescription(`${client.i18n.get(language, "music", "rewind_beyond")}`,)
              .setColor(client.color)
            ]
          }
          
        );
      }
    } else if (value && isNaN(value)) {
      return msg.edit(
        {
          embeds: [
            new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "rewind_invalid", {
              prefix: "/",
            })}`,)
            .setColor(client.color)
          ]
        }
      );
    }

    if (!value) {
      if (song_position - rewindNum > 0) {
        await player.seek(song_position - rewindNum);

        const rewind2 = new EmbedBuilder()
          .setDescription(
            `${client.i18n.get(language, "music", "rewind_msg", {
              duration: CurrentDuration,
            })}`,
          )
          .setColor(client.color);

        msg.edit({ content: " ", embeds: [rewind2] });
      } else {
        return msg.edit(
          {embeds: [
            new EmbedBuilder()
            .setDescription(`${client.i18n.get(language, "music", "rewind_beyond")}`,)
            .setColor(client.color)
          ]}
          
        );
      }
    }
  },
};
