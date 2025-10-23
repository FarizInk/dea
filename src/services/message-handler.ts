import {
  Message,
  MessagePayload,
  CommandInteraction,
  type InteractionEditReplyOptions,
} from 'discord.js'
import { botClient } from '../client'
import { getImageEmbed } from '../utils/embed'
import { compressVideo } from '../utils'
import {
  removeFiles,
  basicGetter,
  getLinks,
  isAllowedUrl,
} from '../utils/scrapper'
import * as fs from 'fs'

async function removeEmoji(message: Message, emoji: string) {
  try {
    const fetchedMessage = await message.channel.messages.fetch(message.id)
    const reaction = fetchedMessage.reactions.cache.get(emoji)
    if (reaction && botClient.user) {
      await reaction.users.remove(botClient.user?.id)
    }
  } catch (error) {
    console.error('Error removing reaction:', error)
  }
}

async function send(
  message: Message | CommandInteraction,
  payload: string | MessagePayload | InteractionEditReplyOptions
) {
  if (message instanceof Message) {
    await message.reply(payload as string | MessagePayload)
  } else if (message instanceof CommandInteraction) {
    await message.editReply(payload)
  }
}

async function processFiles(files: string[]) {
  // Check if files are larger than 8MB and compress if needed
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue

    const stats = fs.statSync(file)
    if (stats.size / (1024 * 1024) >= 8) {
      await compressVideo(file)
    }
  }
}

async function sendMediaFiles(
  message: Message | CommandInteraction,
  files: string[],
  embed?: any
) {
  const totalFiles = files.length

  if (totalFiles === 1) {
    const imageEmbed = getImageEmbed(files)
    if (imageEmbed) embed?.setImage(imageEmbed)

    await send(message, {
      files,
      embeds: embed ? [embed] : [],
    })
    return
  }

  if (totalFiles <= 10) {
    await send(message, {
      files,
      embeds: embed ? [embed] : [],
    })
    return
  }

  // Handle files in batches of 10 (Discord limit)
  let batchFiles: Exclude<(typeof files)[number], undefined>[] = []

  for (let i = 0; i < totalFiles; i++) {
    if (files[i]) {
      batchFiles.push(files[i] as Exclude<(typeof files)[number], undefined>)
    }

    const isLastFile = i + 1 === totalFiles
    const isBatchFull = (i + 1) % 10 === 0

    if (isLastFile || isBatchFull) {
      const embeds = embed && batchFiles.length === 1 ? [embed] : []

      if (isLastFile && batchFiles.length === 1) {
        const imageEmbed = getImageEmbed(batchFiles)
        if (imageEmbed) embed?.setImage(imageEmbed)
      }

      if (message instanceof CommandInteraction) {
        await message.followUp({ files: batchFiles, embeds })
      } else {
        await send(message, { files: batchFiles, embeds })
      }

      if (isBatchFull) {
        batchFiles = []
      }
    }
  }
}

export async function handleMessageLink(
  message: Message | CommandInteraction,
  content: string
) {
  let links = getLinks(content)

  if (links.length === 0 && message instanceof CommandInteraction) {
    await send(message, "I didn't find the link")
  }

  // Get only one link if user sends more than 1 links when using slash command
  if (message instanceof CommandInteraction) links = links.slice(0, 1)

  const doEmoji = '🫰'

  for (const link of links) {
    if (!link) continue
    if (!isAllowedUrl(link)) continue

    // React emoji to user message so user knows message is being processed
    if (message instanceof Message) await message.react(doEmoji)

    const data = await basicGetter(link)

    if (data.files.length === 0 && data.embed === null) {
      await send(message, "Sorry, I can't get media from that link.")
      continue
    }

    await processFiles(data.files)
    await sendMediaFiles(message, data.files, data.embed)
    await removeFiles(data.files)
  }

  if (botClient && message instanceof Message) {
    await removeEmoji(message, doEmoji)
  }
}
