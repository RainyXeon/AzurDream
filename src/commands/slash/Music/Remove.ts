import {
  EmbedBuilder,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  ApplicationCommandOptionType,
} from "discord.js";
import { convertTime } from "../../../structures/ConvertTime.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["remove"],
  description: "Remove song from queue",
  category: "Music",
  options: [
    {
      name: "position",
      description: "The position in queue want to remove.",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    const msg = await interaction.deferReply({ ephemeral: false });

    const player = client.manager.getQueue(interaction.guild!.id);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);
    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    const tracks = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger("position");
    if (tracks == 0)
      return interaction.editReply(
        `${client.i18n.get(language, "music", "removetrack_already")}`,
      );
    if (Number(tracks) > player.songs.length)
      return interaction.editReply(
        `${client.i18n.get(language, "music", "removetrack_notfound")}`,
      );

    const song = player.songs[Number(tracks) - 1];

    player.songs.splice(Number(tracks) - 1, 1);

    const embed = new EmbedBuilder()
      .setDescription(
        `${client.i18n.get(language, "music", "removetrack_desc", {
          name: String(song.name),
          url: song.url,
          duration: convertTime(song.duration as number),
          request: String(song.member),
        })}`,
      )
      .setColor(client.color);

    return interaction.editReply({ embeds: [embed] });
  },
};
