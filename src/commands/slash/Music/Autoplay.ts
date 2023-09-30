import {
  EmbedBuilder,
  CommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";

// Main code
export default {
  name: ["autoplay"],
  description: "Autoplay music (Random play songs)",
  category: "Music",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    await interaction.deferReply({ ephemeral: false });

    const msg = await interaction.editReply(
      `${client.i18n.get(language, "music", "autoplay_loading")}`,
    );
    const player = client.manager.getQueue(interaction.guild!);
    if (!player)
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_player")}`);

    const { channel } = (interaction.member as GuildMember).voice;
    if (
      !channel ||
      (interaction.member as GuildMember).voice.channel !==
        interaction.guild!.members.me!.voice.channel
    )
      return msg.edit(`${client.i18n.get(language, "noplayer", "no_voice")}`);

    if (player.autoplay == true) {
      client.manager.toggleAutoplay(interaction.guild!);

      const off = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_off")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [off] });
    } else {
      client.manager.toggleAutoplay(interaction.guild!);
      const identifier = player.songs[0]!.id;
      const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
      const res = await client.manager.search(search);

      await client.manager.play(
        (interaction.member as GuildMember)!.voice!.channel!,
        String(res[1]),
        {
          member: interaction.member as GuildMember,
          textChannel: interaction.channel as TextChannel,
        },
      );

      const on = new EmbedBuilder()
        .setDescription(`${client.i18n.get(language, "music", "autoplay_on")}`)
        .setColor(client.color);

      msg.edit({ content: " ", embeds: [on] });
    }
  },
};
