import { Client, GatewayIntentBits } from 'discord.js'

export const botClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent, // REQUIRED TO READ MESSAGE CONTENT
  ],
})
