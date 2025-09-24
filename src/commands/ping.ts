import { CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction) {
  // Calculate response latency
  const responseLatency = Date.now() - interaction.createdTimestamp;

  // Calculate API latency
  const apiLatency = interaction.client.ws.ping;

  // Reply with both latencies
  return interaction.reply({
    content: `Pong! 🏓\nResponse Latency: ${responseLatency}ms\nAPI Latency: ${apiLatency}ms`,
    flags: MessageFlags.Ephemeral,
  });
}
