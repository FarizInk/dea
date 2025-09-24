import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { handleMessageLink } from '../dea';

export const data = new SlashCommandBuilder()
  .setName("get")
  .setDescription("Get Media from Link")
  .addStringOption((option) =>
    option.setName("link").setDescription("Paste the link").setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const value = interaction.options.getString('link');

  if (value) {
    await interaction.deferReply(); // ephemeral option is valid inside of this function
    return await handleMessageLink(interaction, value);
  }

  return interaction.reply('Please enter link.');
}
