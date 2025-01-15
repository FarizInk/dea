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
    let links: string[] = []
    // @ts-ignore
    isScrappedMedia().forEach((link) => {
      const url = new URL(`https:${link}`);
      links.push(`${url.protocol}//${url.host}`)
    })

    const supportedMedias = [...new Set(links)].map((link) => `\n - ${link}`)
    await command.reply(`Supported Media: ${supportedMedias}`)
  }
}
