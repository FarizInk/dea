import axios from 'axios';
import { load } from 'cheerio';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('convert')
  .setDescription('Convert Currency')
  .addStringOption(option =>
    option.setName('from').setDescription('From Currency Code').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('to').setDescription('To Currency Code').setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('amount')
      .setDescription('write the amount without comma and dot')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const fromValue = interaction.options.getString('from');
  const toValue = interaction.options.getString('to');
  const amount = interaction.options.getInteger('amount');
  const from = fromValue ? fromValue.toUpperCase() : null;
  const to = toValue ? toValue.toUpperCase() : null;

  if (!from || !to || amount === null || amount === undefined) {
    return interaction.reply('Your Input not valid.');
  }

  try {
    const url = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from}&To=${to}`;
    const { data } = await axios.get(url);

    const $ = load(data);
    const baseElement = 'div[data-testid=conversion] > div > div > div';
    const textFrom = $(`${baseElement} > p:nth-child(1)`).text();
    const fadedDigits = $(`${baseElement} > p:nth-child(2) > span`).text();
    const textTo = $(`${baseElement} > p:nth-child(2)`).text();

    return interaction.reply(`${textFrom} ${textTo.replace(fadedDigits, '').trim()}`);
  } catch {
    return interaction.reply('Something Wrong 😞');
  }
}
