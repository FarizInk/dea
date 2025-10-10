import {
  bold,
  italic,
  MessageFlags,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js'
import { convertCurrency } from '../dea'
import { removeEnding } from '../utils/utils'

export const data = new SlashCommandBuilder()
  .setName('convert')
  .setDescription('Convert Currency')
  .addIntegerOption(option =>
    option
      .setName('amount')
      .setDescription('write the amount without comma and dot')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('from')
      .setDescription('From Currency Code')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('to').setDescription('To Currency Code').setRequired(true)
  )

export async function execute(interaction: ChatInputCommandInteraction) {
  const fromValue = interaction.options.getString('from')
  const toValue = interaction.options.getString('to')
  const amount = interaction.options.getInteger('amount')
  const from = fromValue ? fromValue.toUpperCase() : null
  const to = toValue ? toValue.toUpperCase() : null

  if (!from || !to || amount === null || amount === undefined) {
    return interaction.reply({
      content: 'Your Input not valid.',
      flags: MessageFlags.Ephemeral,
    })
  }

  const data = await convertCurrency(amount.toString(), from, to)

  if (data) {
    return interaction.reply({
      content: `${bold(data.from.nominal?.toString() ?? '')} ${bold(data.from.currency)} = ${bold(removeEnding(data.to.nominal.toString(), data.to.fadedDigits))}${data.to.fadedDigits ? italic(data.to.fadedDigits) : ''} ${bold(data.to.currency)}`,
      flags: MessageFlags.Ephemeral,
    })
  }

  return interaction.reply({
    content: 'Something Wrong 😞',
    flags: MessageFlags.Ephemeral,
  })
}
