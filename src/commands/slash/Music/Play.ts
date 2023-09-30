import {
  PermissionsBitField,
  ApplicationCommandOptionType,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Manager } from "../../../manager.js";

export default {
  name: ["play"],
  description: "Play a song from any types",
  category: "Music",
  lavalink: true,
  options: [
    {
      name: "search",
      description: "The song link or name",
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ],
  run: async (
    interaction: CommandInteraction,
    client: Manager,
    language: string,
  ) => {
    try {
      if (
        (interaction.options as CommandInteractionOptionResolver).getString(
          "search",
        )
      ) {
        await interaction.deferReply({ ephemeral: false });
        let player = client.manager.getQueue(interaction.guild!);
        const value = (
          interaction.options as CommandInteractionOptionResolver
        ).get("search")!.value;
        const msg = await interaction.editReply(
          `${client.i18n.get(language, "music", "play_loading", {
            result: String(
              (interaction.options as CommandInteractionOptionResolver).get(
                "search",
              )!.value,
            ),
          })}`,
        );
        await client.queue_message.set(interaction.user.id, msg.id);

        const { channel } = (interaction.member as GuildMember).voice;
        if (!channel)
          return msg.edit(
            `${client.i18n.get(language, "music", "play_invoice")}`,
          );
        if (
          !interaction
            .guild!.members.cache.get(client.user!.id)!
            .permissions.has(PermissionsBitField.Flags.Connect)
        )
          return msg.edit(`${client.i18n.get(language, "music", "play_join")}`);
        if (
          !interaction
            .guild!.members.cache.get(client.user!.id)!
            .permissions.has(PermissionsBitField.Flags.Speak)
        )
          return msg.edit(
            `${client.i18n.get(language, "music", "play_speak")}`,
          );

        await client.manager.play(
          (interaction.member as GuildMember)!.voice!.channel!,
          String(value),
          {
            member: interaction.member as GuildMember,
            textChannel: interaction.channel as TextChannel,
          },
        );
      }
    } catch (e) {}
  },
};
