import { EmbedBuilder } from 'discord.js'
import type {
  FxTwitterResponse,
  InstagramGraphQLResponse,
  Response,
  VxTwitterResponse,
  InstagramStoryClientResponse,
  TikTokParserResponse,
  ThreadsGraphQLResponse,
  BskxResponse,
} from '../types'

function createValidTimestamp(timeInput?: any): Date | null {
  if (!timeInput) return null

  try {
    let timestamp = timeInput

    // If it's a number, determine if it's in seconds or milliseconds
    if (typeof timestamp === 'number') {
      // If timestamp is larger than year 2025 in seconds, it's likely in milliseconds
      // 2025-01-01 in seconds = 1735689600
      // 2025-01-01 in milliseconds = 1735689600000
      if (timestamp > 1735689600000) {
        // Already in milliseconds, no conversion needed
      } else if (timestamp > 1735689600) {
        // In seconds, convert to milliseconds
        timestamp = timestamp * 1000
      } else {
        // Too old, likely invalid
        console.warn('Timestamp too old:', timeInput)
        return null
      }
    }

    const date = new Date(timestamp)
    // Check if the date is valid and reasonable (not too far in the future or past)
    const now = new Date()
    const minDate = new Date('2000-01-01')
    const maxDate = new Date(now.getFullYear() + 1, 0, 1) // Next year

    if (isNaN(date.getTime()) || date < minDate || date > maxDate) {
      console.warn('Invalid timestamp detected:', timeInput, '->', date.toISOString())
      return null
    }

    return date
  } catch (error) {
    console.warn('Error parsing timestamp:', timeInput, error)
    return null
  }
}

export function generateEmbed(response: Response): EmbedBuilder | null {
  const { metadata, data }: Response = response
  if (!data) return null

  try {
    if (metadata.provider_data === 'fxtwitter') {
      const item = data as FxTwitterResponse

      return new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(item.author.name)
        .setURL(`https://x.com/${item.author.screen_name}`)
        .setAuthor({ name: `@${item.author.screen_name}` })
        .setDescription(item.text)
        .setThumbnail(item.author.avatar_url)
        .setTimestamp(createValidTimestamp(item.created_at))
        .setFooter({ text: 'X / Twitter' })
    } else if (metadata.provider_data === 'vxtwitter') {
      const item = data as VxTwitterResponse

      return new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(item.user_name)
        .setURL(`https://x.com/${item.user_screen_name}`)
        .setAuthor({ name: `@${item.user_screen_name}` })
        .setDescription(item.text)
        .setThumbnail(item.user_profile_image_url.replace('_normal', ''))
        .setTimestamp(createValidTimestamp(item.date))
        .setFooter({ text: 'X / Twitter' })
    } else if (metadata.provider_data === 'instagram-embed') {
      const item = data as InstagramGraphQLResponse

      return new EmbedBuilder()
        .setColor(0xc72784)
        .setTitle(
          item.owner.full_name === ''
            ? item.owner.username
            : item.owner.full_name
        )
        .setURL(`https://instagram.com/${item.owner.username}`)
        .setAuthor({ name: `@${item.owner.username}` })
        .setDescription(
          item.edge_media_to_caption?.edges[0]?.node?.text ?? null
        )
        .setThumbnail(item.owner.profile_pic_url)
        .setTimestamp(
          item.taken_at_timestamp
            ? createValidTimestamp(item.taken_at_timestamp)
            : null
        )
        .setFooter({ text: 'Instagram' })
    } else if (metadata.provider_data === 'instagram-story-client') {
      const item = data as InstagramStoryClientResponse

      return new EmbedBuilder()
        .setColor(0xc72784)
        .setTitle(
          item.user.full_name === '' ? item.user.username : item.user.full_name
        )
        .setURL(`https://instagram.com/${item.user.username}`)
        .setAuthor({ name: `@${item.user.username}` })
        .setThumbnail(item.user.profile_pic_url)
        .setTimestamp(
          item.taken_at ? createValidTimestamp(item.taken_at * 1000) : null
        )
        .setFooter({ text: 'Instagram Story' })
    } else if (metadata.provider_data === 'tiktok-parser') {
      const item = data as TikTokParserResponse

      return new EmbedBuilder()
        .setColor(0xfe2858)
        .setTitle(item.author.nickname)
        .setURL(`https://tiktok.com/@${item.author.uniqueId}`)
        .setAuthor({ name: `@${item.author.uniqueId}` })
        .setDescription(item.desc === '' ? null : (item.desc ?? null))
        .setThumbnail(item.author.avatarMedium)
        .setTimestamp(
          item.createTime ? createValidTimestamp(parseInt(item.createTime) * 1000) : null
        )
        .setFooter({ text: 'TikTok' })
    } else if (metadata.provider_data === 'threads-graphql') {
      const item =
        (data?.thread_items?.[0]?.post as ThreadsGraphQLResponse) ??
        (data as ThreadsGraphQLResponse)

      return new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(item.user.username)
        .setURL(`https://www.threads.net/@${item.user.username}`)
        .setAuthor({ name: `@${item.user.username}` })
        .setDescription(item.caption.text)
        .setThumbnail(item.user.profile_pic_url)
        .setTimestamp(
          item.taken_at ? createValidTimestamp(item.taken_at * 1000) : null
        )
        .setFooter({ text: 'Threads' })
    } else if (metadata.provider_data === 'bskx') {
      const item = data as BskxResponse

      return new EmbedBuilder()
        .setColor(0x0886fe)
        .setTitle(item.author.displayName ?? '-')
        .setURL(`https://bsky.app/profile/${item.author.handle}`)
        .setAuthor({ name: `@${item.author.handle}` })
        .setDescription(
          item.record.text === '' ? null : (item.record.text ?? null)
        )
        .setThumbnail(item.author.avatar ?? null)
        .setTimestamp(
          item.record.createdAt ? createValidTimestamp(item.record.createdAt) : null
        )
        .setFooter({ text: 'Bluesky' })
    }
  } catch (error) {
    console.error('Error generate embed', error)
  }
  // else if (metadata.provider_data === "btch-downloader" && response.platform === "tiktok") {
  //   return {
  //     color: 0xfe2858,
  //     title: data.author_name,
  //     url: `https://tiktok.com/@${data.author_unique_id}`,
  //     author: { name: `@${data.author_unique_id}` },
  //     description: data.title,
  //     footer: { text: "Tiktok" },
  //   };
  // }

  return null
}
