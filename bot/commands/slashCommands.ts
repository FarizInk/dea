import { blockQuote, inlineCode, unorderedList, type CommandInteraction } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Example {
  @Slash({ name: "ping", description: 'ping! the bot' })
  async pingCommand(command: CommandInteraction): Promise<void> {
    await command.reply('pong!')
  }

  @Slash({ name: "info", description: 'information about Dea' })
  async infoCommand(command: CommandInteraction): Promise<void> {
    await command.reply(`Supported Media: ${inlineCode('Instagram')}, ${inlineCode('X / Twitter')}, ${inlineCode('Tiktok')}, ${inlineCode('Twitch')}`)
  }
}
