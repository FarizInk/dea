import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from 'discord.js';

export const btnNo = new ButtonBuilder()
  .setCustomId('no')
  .setLabel('No')
  .setStyle(ButtonStyle.Danger);

export async function execute(intterraction: ButtonInteraction) {
  await intterraction.message.edit({
    components: [],
  });
  await intterraction.reply({
    content: 'Ok, have a nice day!',
    flags: MessageFlags.Ephemeral,
  });
}
