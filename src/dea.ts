import { Client, CommandInteraction, Message, MessagePayload, type InteractionEditReplyOptions } from "discord.js";
import { compressVideo } from "./utils/utils";
import * as fs from "fs";
import { basicGetter, getLinks, isAllowedUrl, removeFiles } from "./utils/scrapper";

const removeEmoji = async (client: Client, message: Message, emoji: string) => {
  try {
    const fetchedMessage = await message.channel.messages.fetch(message.id);
    const reaction = fetchedMessage.reactions.cache.get(emoji);
    if (reaction && client.user) await reaction.users.remove(client.user?.id);
  } catch (error) {
    console.error("Error removing reaction:", error);
  }
};

const send = async (message: Message | CommandInteraction, payload: string | MessagePayload | InteractionEditReplyOptions) => {
  if (message instanceof Message) {
    await message.reply(payload as string | MessagePayload);
  } else if (message instanceof CommandInteraction) {
    await message.editReply(payload);
  }
};

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
        message instanceof CommandInteraction ? await message.followUp({ files, embeds }) : await send(message, { files, embeds });
      } else if ((i + 1) % 10 === 0) {
        message instanceof CommandInteraction ? await message.followUp({ files, embeds }) : await send(message, { files, embeds });
        files = [];
      }
    }

    removeFiles(data?.files ?? []);
  }

  if (client && message instanceof Message) {
    await removeEmoji(client, message, doEmoji);
  }
};
