import type { CommandInteraction } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Example {
  @Slash({ name: "ping", description: 'ping! the bot' })
  async simplePing(command: CommandInteraction): Promise<void> {
    await command.reply('pong!')
  }
}
