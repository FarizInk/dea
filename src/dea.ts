import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  Message,
  MessagePayload,
  quote,
  type InteractionEditReplyOptions,
} from "discord.js";
import { compressVideo, isImageOrVideo } from "./utils/utils";
import * as fs from "fs";
import {
  basicGetter,
  getLinks,
  isAllowedUrl,
  removeFiles,
} from "./utils/scrapper";
import { btnGetMedia } from "./buttons/get-media";
import { btnNo } from "./buttons/no";
import { botClient } from "./client";

async function removeEmoji(message: Message, emoji: string) {
  try {
    const fetchedMessage = await message.channel.messages.fetch(message.id);
    const reaction = fetchedMessage.reactions.cache.get(emoji);
    if (reaction && botClient.user)
      await reaction.users.remove(botClient.user?.id);
  } catch (error) {
    console.error("Error removing reaction:", error);
  }
}

function getImageEmbed(files: string[]) {
  let file: string | null = null;

  [...files].forEach((path) => {
    if (file) return;
    if (isImageOrVideo(path) === "image") file = path;
  });

  if (!file) return null;

  const pathSplitter = (file as string).split("/");
  return `attachment://${pathSplitter[pathSplitter.length - 1]}`;
}

async function send(
  message: Message | CommandInteraction,
  payload: string | MessagePayload | InteractionEditReplyOptions,
) {
  if (message instanceof Message) {
    await message.reply(payload as string | MessagePayload);
  } else if (message instanceof CommandInteraction) {
    await message.editReply(payload);
  }
}

export async function handleMessageLink(
  message: Message | CommandInteraction,
  content: string,
) {
  let links = getLinks(content);

  if (links.length === 0 && message instanceof CommandInteraction) {
    await send(message, "I didn't find the link");
  }

  // get only one link if user send more than 1 links if using slash command
  if (message instanceof CommandInteraction) links = links.slice(0, 1);

  const doEmoji = "🫰";
  for (let i = 0; i < links.length; i++) {
    const link: string | null = links[i] ?? null;
    if (!link) continue;

    const isAllowed = isAllowedUrl(link);
    if (!isAllowed) continue;

    // react emoji to user message, so user know message being process
    if (message instanceof Message) await message.react(doEmoji);

    const data = await basicGetter(link);

    if (data.files.length === 0 && data.embed === null) {
      await send(message, "Sorry, I can't get media from that link.");
      continue;
    }

    // check if file more than 8mb, then compress the file (video)
    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i];
      if (!file) continue;
      const stats = fs.statSync(file);
      if (stats.size / (1024 * 1024) >= 8) {
        await compressVideo(file);
      }
    }

    const totalFiles = data.files.length;

    if (totalFiles === 1) {
      const imageEmbed = getImageEmbed(data.files);
      if (imageEmbed) data.embed?.setImage(imageEmbed);

      await send(message, {
        files: data.files,
        embeds: data.embed ? [data.embed] : [],
      });
      await removeFiles(data.files);
      continue;
    }

    if (totalFiles <= 10) {
      const imageEmbed = getImageEmbed(data.files);
      if (imageEmbed) data.embed?.setImage(imageEmbed);

      await send(message, {
        files: data.files,
        embeds: data.embed ? [data.embed] : [],
      });
      await removeFiles(data.files);
      continue;
    }

    let files: Exclude<(typeof data.files)[number], undefined>[] = [];
    for (let i = 0; i < totalFiles; i++) {
      if (data.files[i])
        files.push(
          data.files[i] as Exclude<(typeof data.files)[number], undefined>,
        );

      if (i + 1 === totalFiles) {
        const imageEmbed = getImageEmbed(data.files);
        if (imageEmbed) data.embed?.setImage(imageEmbed);

        const embeds = data.embed ? [data.embed] : [];

        if (message instanceof CommandInteraction) {
          await message.followUp({ files, embeds });
        } else {
          await send(message, { files, embeds });
        }
      } else if ((i + 1) % 10 === 0) {
        if (message instanceof CommandInteraction) {
          await message.followUp({ files });
        } else {
          await send(message, { files });
        }
        files = [];
      }
    }

    await removeFiles(data?.files ?? []);
  }

  if (botClient && message instanceof Message) {
    await removeEmoji(message, doEmoji);
  }
}

export async function actionWhenFoundUrl(message: Message) {
  let links = getLinks(message.content);
  let isAllowed = false;
  links.forEach((link) => {
    const result = isAllowedUrl(link);
    if (result) isAllowed = true;
  });
  if (isAllowed && !message.author.bot) {
    if (message.guild) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        btnGetMedia,
        btnNo,
      ]);

      const link = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
      await message.author.send({
        content: `${quote(message.content)}\nWanna get media from [this message](${link})?`,
        components: [row],
      });
    } else {
      await handleMessageLink(message, message.content);
    }
  }
}
