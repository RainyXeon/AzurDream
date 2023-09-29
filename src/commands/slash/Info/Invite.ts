import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  version,
  CommandInteraction,
  ButtonStyle,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["invite"],
  description: "Shows the invite information of the Bot",
  category: "Info",
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string
  ) => {
    await interaction.deferReply({ ephemeral: false });
    const invite = new EmbedBuilder()
      .setTitle(
        `${client.i18n.get(language, "info", "inv_title", {
          username: client.user!.username,
        })}`
      )
      .setDescription(
        `${client.i18n.get(language, "info", "inv_desc", {
          username: client.user!.username,
        })}`
      )
      .addFields([
        {
          name: "ByteBlaze",
          value: "https://github.com/RainyXeon/ByteBlaze",
          inline: false,
        },
      ])
      .setTimestamp()
      .setColor(client.color);

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite Me")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${
            client.user!.id
          }&permissions=8&scope=bot%20applications.commands`
        )
    );

    await interaction.editReply({ embeds: [invite], components: [row2] });
  },
};
