import PocketBase from "pocketbase";
import { Client, codeBlock, Message } from "discord.js";
import env from "./env.js";
import log from "./log.js";

export const setupPB = async () => {
  const pocketbase = new PocketBase(env.VITE_POCKETBASE_URL);
  const auth = await pocketbase.admins.authWithPassword(
    env.POCKETBASE_USER_EMAIL,
    env.POCKETBASE_USER_PASSWORD,
  );

  return {
    pocketbase,
    auth,
  };
};

const validateGuild = (id: string|null) => {
  if (env.GUILD_ID !== '' && id !== null) {
    const result = id === env.GUILD_ID
    // NOTE: temp add env mode in order to handle file log too big
    if (!result && env.MODE === 'debug') log.warn(`Guild ID: ${id} not allowed`)
    return result;
  }

  return true;
};

export const understandMsg = (message: Message, client: Client) => {
  const validate = validateGuild(message.guildId ?? null);
  // NOTE: if link have / include word "dea", the link not be saved.
  if (message.author.id !== client.application?.id && validate) {
    if (message.toString() === "guildId") {
      message.reply(
        message.guildId ? codeBlock(message.guildId) : "Gatau bang 🤷‍♀️",
      );
    } else if (message.toString() === "channelId") {
      message.reply(
        message.channelId ? codeBlock(message.channelId) : "Gatau bang 🤷‍♀️",
      );
    } else if (message.toString() === "myId") {
      message.reply(
        message.author.id ? codeBlock(message.author.id) : "Gatau bang 🤷‍♀️",
      );
    } else if (message.toString() === "serverCount") {
      message.reply(`Watching ${client.guilds.cache.size} Guild`);
    } else if (message.toString().toLowerCase() === "k") {
      message.reply(message.toString().toLowerCase() == message.toString() ? 'o' : 'O');
    } else if (/\bdea\b/.test(message.toString().toLowerCase())) {
      const word = 'dea'
      const regex = /\p{Extended_Pictographic}/ug
      const msg = message.toString().toLowerCase()
      const emoji = msg.slice(msg.indexOf(word) + word.length).trim().split(' ')[0]
      if (regex.test(emoji)) {
        message.react(emoji)
      }
    } else {
      getLinks(message);
    }
  }
};

export const getLinks = async (message: Message) => {
  const msgHttp: Array<string> =
    message.toString().match(/\bhttp?:\/\/\S+/gi) ?? [];
  const msgHttps: Array<string> =
    message.toString().match(/\bhttps?:\/\/\S+/gi) ?? [];
  const links = msgHttp.concat(msgHttps);

  if (links.length >= 1) {
    const embededLinks = createEmbed(links);
    embededLinks.forEach((link) => message.reply(link));

    await sendToPocketBase(message, links);
  }
};

const getTag = async (slug: string) => {
  const { pocketbase: pb } = await setupPB();
  let data = null;
  try {
    data = await pb.collection("dea_tags").getFirstListItem(
      `slug="${slug}"`,
    );
  } catch (error) {
    data = await pb.collection("dea_tags").create({
      "user_id": null,
      "name": slug,
      "slug": slug,
    });
  }

  return data;
};

export const sendToPocketBase = async (
  message: Message,
  links: Array<string>,
) => {
  const { pocketbase: pb } = await setupPB();

  let tags = [
    await getTag("automated"),
    await getTag(`channel_${message.channelId}`),
  ];

  if (env.MODE === 'debug') {
    tags.push(await getTag(env.MODE))
  }

  const data = {
    "user_id": null,
    "discord_user_id": message.author.id ?? null,
    "guild_id": message.guildId ?? null,
    "message_id": message.id ?? null,
    "message": message.toString(),
    "message_created_at": new Date(message.createdTimestamp),
    "message_updated_at": new Date(message.createdTimestamp),
    "raw_links": links,
    "message_log": null,
    "url": message.url,
    "sender": message.author.username,
    "tags": tags.map((tag) => tag.id),
    "is_bot": message.author.bot,
  };

  await pb.collection("dea_messages").create(data);
  message.react("👍");
};

export const createEmbed = (links: Array<string>) => {
  let embededLinks: Array<string> = [];
  links.forEach((link) => {
    if (!link.includes("ddinstagram.com") && (link.includes("instagram.com/p/") || link.includes("instagram.com/reels/") || link.includes("instagram.com/reel/"))) {
      embededLinks.push(link.replace("instagram.com", "ddinstagram.com"));
    } else if (
      !link.includes("fxtwitter.com") && link.includes("twitter.com")
    ) {
      embededLinks.push(link.replace("twitter.com", "fxtwitter.com"));
    } else if (!link.includes("fxtwitter.com") && link.includes("x.com")) {
      embededLinks.push(link.replace("x.com", "fxtwitter.com"));
    } else if (
      !link.includes("www.vt.tiktok.com") && link.includes("www.tiktok.com")
    ) {
      embededLinks.push(link.replace("www.tiktok.com", "vm.dstn.to"));
    } else if (!link.includes("vt.tiktok.com") && link.includes("tiktok.com")) {
      embededLinks.push(link.replace("tiktok.com", "vm.dstn.to"));
    }
  });

  return embededLinks;
};
