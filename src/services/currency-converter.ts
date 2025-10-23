import { bold, italic } from 'discord.js'
import axios from 'axios'
import { load } from 'cheerio'
import { Message } from 'discord.js'
import { removeEnding } from '../utils'

type CurrencyConversion = {
  from: {
    nominal: number | string
    currency: string
  }
  to: {
    nominal: number | string
    currency: string
    fadedDigits: string
  }
}

export async function convertCurrency(
  amount: string | number,
  from: string,
  to: string
): Promise<CurrencyConversion | null> {
  try {
    const url = `https://www.xe.com/currencyconverter/convert/?Amount=${amount}&From=${from.toUpperCase()}&To=${to.toUpperCase()}`
    const { data } = await axios.get(url)

    const $ = load(data)
    const baseElement = 'div[data-testid=conversion] > div > div > div'

    const textFrom = $(`${baseElement} > p:nth-child(1)`).text()
    const nominalFrom = textFrom.split(' ')?.[0]?.trim() ?? ''
    const currencyFrom = textFrom
      .split(' ')
      .slice(1)
      .join(' ')
      .replace('=', '')
      .trim()

    const fadedDigits = $(`${baseElement} > p:nth-child(2) > span.faded-digits`)
      .text()
      .trim()

    const textTo = $(`${baseElement} > p:nth-child(2)`).text()
    const nominalTo = textTo.split(' ')?.[0]?.trim() ?? ''
    const currencyTo = textTo.split(' ').slice(1).join(' ')

    return {
      from: {
        nominal: nominalFrom,
        currency: currencyFrom,
      },
      to: {
        nominal: nominalTo,
        currency: currencyTo,
        fadedDigits,
      },
    }
  } catch (error) {
    console.error(error)
  }

  return null
}

export async function handleMessageConvertCurrency(
  message: Message,
  content: string
) {
  const params = content
    .replace('convert', '')
    .replace(' to ', ' ')
    .trim()
    .split(' ')

  if (params.length === 3) {
    const data = await convertCurrency(
      params?.[0] ?? '',
      params?.[1] ?? '',
      params?.[2] ?? ''
    )

    if (data) {
      await message.reply(
        `${bold(data.from.nominal?.toString() ?? '')} ${bold(data.from.currency)} = ${bold(removeEnding(data.to.nominal.toString(), data.to.fadedDigits))}${data.to.fadedDigits ? italic(data.to.fadedDigits) : ''} ${bold(data.to.currency)}`
      )
    }
  }
}
