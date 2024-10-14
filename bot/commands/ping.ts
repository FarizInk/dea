import type { CommandInteraction, Message } from "discord.js";
import type { SimpleCommandMessage } from "discordx";
import {
  Discord,
  SimpleCommand,
  SimpleCommandOption,
  SimpleCommandOptionType,
  Slash,
} from "discordx";

@Discord()
export class Example {
  @SimpleCommand()
  async ping(command: SimpleCommandMessage): Promise<void> {
    const member = command.message.member;
    if (member) {
      await command.message.reply(`👋 ${member.toString()}`);
    } else {
      await command.message.reply("👋 hello");
    }
  }
}
