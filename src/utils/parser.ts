import { EmbedBuilder } from "discord.js";
import type { FxTwitterResponse } from "../types/fxtwitter";
import type { InstagramGraphQLResponse } from "../types/instagram-graphql";
import type { Response } from "../types/response";
import type { VxTwitterResponse } from "../types/vxtwitter";
import type { InstagramStoryClientResponse } from "../types/instagram-story-client";
import type { TikTokParserResponse } from "../types/tiktok";
import type { ThreadsGraphQLResponse } from "../types/threads-graphql";
import type { BskxResponse } from "../types/bluesky";

export function parseEmbed(response: Response): EmbedBuilder | null {
  const { via, data }: Response = response;
  if (!data) return null;

  if (via === "fxtwitter") {
    const item = data as FxTwitterResponse;

    return new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(item.author.name)
      .setURL(`https://x.com/${item.author.screen_name}`)
      .setAuthor({ name: `@${item.author.screen_name}` })
      .setDescription(item.text)
      .setThumbnail(item.author.avatar_url)
      .setTimestamp(new Date(item.created_at))
      .setFooter({ text: "X / Twitter" });
  } else if (via === "vxtwitter") {
    const item = data as VxTwitterResponse;

    return new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(item.user_name)
      .setURL(`https://x.com/${item.user_screen_name}`)
      .setAuthor({ name: `@${item.user_screen_name}` })
      .setDescription(item.text)
      .setThumbnail(item.user_profile_image_url.replace("_normal", ""))
      .setTimestamp(new Date(item.date))
      .setFooter({ text: "X / Twitter" });
  } else if (via === "instagram-graphql") {
    const item = data as InstagramGraphQLResponse;

    if (
      !item.owner?.username ||
      !item.owner.full_name ||
      !item.taken_at_timestamp
    )
      return null;

    return new EmbedBuilder()
      .setColor(0xc72784)
      .setTitle(item.owner.full_name)
      .setURL(`https://instagram.com/${item.owner.username}`)
      .setAuthor({ name: `@${item.owner.username}` })
      .setDescription(item.edge_media_to_caption?.edges[0]?.node?.text ?? null)
      .setThumbnail(item.owner.profile_pic_url)
      .setTimestamp(
        item.taken_at_timestamp
          ? new Date(parseInt(item.taken_at_timestamp + "000"))
          : null,
      )
      .setFooter({ text: "Instagram" });
  } else if (via === "instagram-story-client") {
    const item = data as InstagramStoryClientResponse;

    return new EmbedBuilder()
      .setColor(0xc72784)
      .setTitle(item.user.full_name)
      .setURL(`https://instagram.com/${item.user.username}`)
      .setAuthor({ name: `@${item.user.username}` })
      .setThumbnail(item.user.profile_pic_url)
      .setTimestamp(
        item.taken_at ? new Date(parseInt(item.taken_at + "000")) : null,
      )
      .setFooter({ text: "Instagram Story" });
  } else if (via === "tiktok-parser") {
    const item = data as TikTokParserResponse;

    return new EmbedBuilder()
      .setColor(0xfe2858)
      .setTitle(item.author.nickname)
      .setURL(`https://tiktok.com/@${item.author.uniqueId}`)
      .setAuthor({ name: `@${item.author.uniqueId}` })
      .setDescription(item.desc)
      .setThumbnail(item.author.avatarMedium)
      .setTimestamp(
        item.createTime ? new Date(parseInt(item.createTime + "000")) : null,
      )
      .setFooter({ text: "TikTok" });
  } else if (via === "threads-graphql") {
    const item = data as ThreadsGraphQLResponse;

    return new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(item.user.username)
      .setURL(`https://www.threads.net/@${item.user.username}`)
      .setAuthor({ name: `@${item.user.username}` })
      .setDescription(item.caption.text)
      .setThumbnail(item.user.profile_pic_url)
      .setTimestamp(
        item.taken_at ? new Date(parseInt(item.taken_at + "000")) : null,
      )
      .setFooter({ text: "Threads" });
  } else if (via === "bskx") {
    const item = data as BskxResponse;

    return new EmbedBuilder()
      .setColor(0x0886fe)
      .setTitle(item.author.displayName ?? "-")
      .setURL(`https://bsky.app/profile/${item.author.handle}`)
      .setAuthor({ name: `@${item.author.handle}` })
      .setDescription(
        item.record.text === "" ? null : (item.record.text ?? null),
      )
      .setThumbnail(item.author.avatar ?? null)
      .setTimestamp(
        item.record.createdAt
          ? new Date(parseInt(item.record.createdAt + "000"))
          : null,
      )
      .setFooter({ text: "Bluesky" });
  }
  // else if (via === "btch-downloader" && response.platform === "tiktok") {
  //   return {
  //     color: 0xfe2858,
  //     title: data.author_name,
  //     url: `https://tiktok.com/@${data.author_unique_id}`,
  //     author: { name: `@${data.author_unique_id}` },
  //     description: data.title,
  //     footer: { text: "Tiktok" },
  //   };
  // }

  return null;
}
