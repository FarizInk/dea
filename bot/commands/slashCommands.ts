import { blockQuote, inlineCode, unorderedList, type CommandInteraction } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";
import { isScrappedMedia } from "../dea.js";

@Discord()
export class Example {
  @Slash({ name: "ping", description: 'ping! the bot' })
  async pingCommand(command: CommandInteraction): Promise<void> {
    await command.reply('pong!')
  }

  @Slash({ name: "info", description: 'information about Dea' })
  async infoCommand(command: CommandInteraction): Promise<void> {
    // @ts-ignore
    const supportedMedias = isScrappedMedia().map((link) => `\n - https:${link}`)
    await command.reply(`Supported Media: ${supportedMedias}`)
  }
}
