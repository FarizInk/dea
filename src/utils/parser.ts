import { EmbedBuilder } from "discord.js";
import type { FxTwitterResponse } from "../types/fxtwitter";
import type { InstagramGraphQLResponse } from "../types/instagram-graphql";
import type { Response } from "../types/response";
import type { VxTwitterResponse } from "../types/vxtwitter";
import type { InstagramStoryClientResponse } from "../types/instagram-story-client";
import type { TikTokParserResponse } from "../types/tiktok";
import type { ThreadsGraphQLResponse } from "../types/threads-graphql";
import type { BskxResponse } from "../types/bluesky";

export function generateEmbed(response: Response): EmbedBuilder | null {
  const { metadata, data }: Response = response;
  if (!data) return null;

  try {
    if (metadata.provider_data === "fxtwitter") {
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
    } else if (metadata.provider_data === "vxtwitter") {
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
    } else if (metadata.provider_data === "instagram-graphql") {
      const item = data as InstagramGraphQLResponse;

      return new EmbedBuilder()
        .setColor(0xc72784)
        .setTitle(
          item.owner.full_name === ""
            ? item.owner.username
            : item.owner.full_name,
        )
        .setURL(`https://instagram.com/${item.owner.username}`)
        .setAuthor({ name: `@${item.owner.username}` })
        .setDescription(
          item.edge_media_to_caption?.edges[0]?.node?.text ?? null,
        )
        .setThumbnail(item.owner.profile_pic_url)
        .setTimestamp(
          item.taken_at_timestamp
            ? new Date(parseInt(item.taken_at_timestamp + "000"))
            : null,
        )
        .setFooter({ text: "Instagram" });
    } else if (metadata.provider_data === "instagram-story-client") {
      const item = data as InstagramStoryClientResponse;

      return new EmbedBuilder()
        .setColor(0xc72784)
        .setTitle(
          item.user.full_name === "" ? item.user.username : item.user.full_name,
        )
        .setURL(`https://instagram.com/${item.user.username}`)
        .setAuthor({ name: `@${item.user.username}` })
        .setThumbnail(item.user.profile_pic_url)
        .setTimestamp(
          item.taken_at ? new Date(parseInt(item.taken_at + "000")) : null,
        )
        .setFooter({ text: "Instagram Story" });
    } else if (metadata.provider_data === "tiktok-parser") {
      const item = data as TikTokParserResponse;

      return new EmbedBuilder()
        .setColor(0xfe2858)
        .setTitle(item.author.nickname)
        .setURL(`https://tiktok.com/@${item.author.uniqueId}`)
        .setAuthor({ name: `@${item.author.uniqueId}` })
        .setDescription(item.desc === "" ? null : (item.desc ?? null))
        .setThumbnail(item.author.avatarMedium)
        .setTimestamp(
          item.createTime ? new Date(parseInt(item.createTime + "000")) : null,
        )
        .setFooter({ text: "TikTok" });
    } else if (metadata.provider_data === "threads-graphql") {
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
    } else if (metadata.provider_data === "bskx") {
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
          item.record.createdAt ? new Date(item.record.createdAt) : null,
        )
        .setFooter({ text: "Bluesky" });
    }
  } catch (error) {
    console.error("Error generate embed", error);
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

  return null;
}
