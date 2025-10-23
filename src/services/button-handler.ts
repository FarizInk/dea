import { ActionRowBuilder, Message, quote, ButtonBuilder } from 'discord.js'
import { btnGetMedia } from '../buttons/get-media'
import { btnNo } from '../buttons/no'
import { getLinks, isAllowedUrl } from '../utils/scrapper'
import { handleMessageLink } from './message-handler'

export async function actionWhenFoundUrl(message: Message) {
  const links = getLinks(message.content)
  let isAllowed = false

  for (const link of links) {
    if (isAllowedUrl(link)) {
      isAllowed = true
      break
    }
  }

  if (isAllowed && !message.author.bot) {
    if (message.guild) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        btnGetMedia,
        btnNo,
      ])

      const discordLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`

      await message.author.send({
        content: `${quote(message.content)}\nWanna get media from [this message](${discordLink})?`,
        components: [row],
      })
    } else {
      await handleMessageLink(message, message.content)
    }
  }
}
