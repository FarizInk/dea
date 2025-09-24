import { Client, CommandInteraction, Message, MessagePayload, type InteractionEditReplyOptions } from "discord.js";
import axios from "axios";
import { config, allowedUrls } from "./config";
import { compressVideo, downloadFile, getEmbed } from "./utils";
import * as fs from "fs";

const basicGetter = async (url: string) => {
  try {
    const { data } = await axios.post(
      config.H_URL,
      {
        url,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.H_TOKEN}`,
        },
        timeout: 60000, // 60 seconds
      },
    );

    const medias = data.medias;
    const fileName = Math.floor(Date.now() / 1000).toString();
    const files = [];
    for (let i = 0; i < medias.length; i++) {
      const mediaUrl = medias[i];
      const filePath = await downloadFile(`${fileName}-${i}`, mediaUrl)
      if (filePath) files.push(filePath);
    }

    return {
      files,
      embed: getEmbed(data),
    };
  } catch {
    return {
      files: [],
      embed: null,
    };
  }
};

export const getLinks = (message: string) => {
  const msgHttp: Array<string> = message.match(/\bhttp?:\/\/\S+/gi) ?? [];
  const msgHttps: Array<string> = message.match(/\bhttps?:\/\/\S+/gi) ?? [];

  return msgHttp.concat(msgHttps);
};

const removeEmoji = async (client: Client, message: Message, emoji: string) => {
  try {
    const fetchedMessage = await message.channel.messages.fetch(message.id);
    const reaction = fetchedMessage.reactions.cache.get(emoji);
    if (reaction && client.user) await reaction.users.remove(client.user?.id);
  } catch {
    // Silent error handling for reaction removal
  }
};

const send = async (message: Message | CommandInteraction, payload: string | MessagePayload | InteractionEditReplyOptions) => {
  if (message instanceof Message) {
    await message.reply(payload as string | MessagePayload);
  } else if (message instanceof CommandInteraction) {
    await message.editReply(payload);
  }
};

const removeFiles = (files: (string | null)[]) => {
  files.forEach((file) => {
    if (file) fs.unlink(file, () => null);
  });
};

export const isAllowedUrl = (link: string): boolean => {
  // Direct match with allowed URL patterns
  const directMatch = allowedUrls.some((a) => link.includes(a));
  if (directMatch) return true;

  // Special case for Instagram URLs with usernames
  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^/]+\/(p|reel|stories|share)\//;
  return instagramRegex.test(link);
}

export const handleMessageLink = async (
  message: Message | CommandInteraction,
  content: string,
  client: Client | null = null
) => {
  let links = getLinks(content);

  if (links.length === 0 && message instanceof CommandInteraction) {
    await send(message, "I didn't find the link");
  }

  if (message instanceof CommandInteraction) links = links.slice(0, 1);

  const doEmoji = "🫰";
  for (let i = 0; i < links.length; i++) {
    const link: string | null = links[i] ?? null;
    if (!link) continue;

    const isAllowed = isAllowedUrl(link);
    if (!isAllowed) continue;

    if (message instanceof Message) await message.react(doEmoji);

    const data = await basicGetter(link);

    if (data.files.length === 0 && data.embed === null) {
      await send(message, "Sorry, I can't get media from that link.");
      continue;
    }
    // check if file more than 8mb
    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i];
      if (!file) continue;
      const stats = fs.statSync(file);
      if (stats.size / (1024 * 1024) >= 8) {
        await compressVideo(file);
      }
    }

    const totalFiles = data.files.length;
    if (totalFiles <= 10) {
      await send(message, {
        files: data.files,
        embeds: data.embed ? [{
          ...data.embed,
          description: data.embed.description ?? undefined,
          thumbnail: data.embed.thumbnail?.url ? { url: data.embed.thumbnail.url } : undefined,
          timestamp: data.embed.timestamp ?? undefined
        }] : []
      });
      removeFiles(data.files);
      continue;
    }

    let files: Exclude<typeof data.files[number], undefined>[] = [];
    for (let i = 0; i < totalFiles; i++) {
      if (data.files[i]) files.push(data.files[i] as Exclude<typeof data.files[number], undefined>);

      const embeds = data.embed ? [{
        ...data.embed,
        description: data.embed.description ?? undefined,
        thumbnail: data.embed.thumbnail?.url ? { url: data.embed.thumbnail.url } : undefined,
        timestamp: data.embed.timestamp ?? undefined
      }] : []

      if (i + 1 === totalFiles) {
        await (message instanceof CommandInteraction ? message.followUp({ files, embeds }) : send(message, { files, embeds }));
      } else if ((i + 1) % 10 === 0) {
        await (message instanceof CommandInteraction ? message.followUp({ files, embeds }) : send(message, { files, embeds }));
        files = [];
      }
    }

    removeFiles(data?.files ?? []);
  }

  if (client && message instanceof Message) {
    await removeEmoji(client, message, doEmoji);
  }
};
