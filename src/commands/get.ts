import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { handleMessageLink } from "../dea";

export const data = new SlashCommandBuilder()
  .setName("get")
  .setDescription("Get Media from Link")
  .addStringOption((option) =>
    option.setName("link").setDescription("Paste the link").setRequired(true),
  );

export async function execute(interaction: CommandInteraction) {
  const value = interaction.options.get("link")?.value ?? null;

  if (value) {
    await interaction.deferReply(); // ephemeral option is valid inside of this function
    return await handleMessageLink(interaction, value.toString());
  }

  return interaction.reply("Please enter link.");
}
