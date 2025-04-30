import {
  ActivityType,
  ButtonInteraction,
  CommandInteraction,
  inlineCode,
  Message,
  type Interaction,
} from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands, kebabToCamel, removeCacheFiles } from "./utils/utils";
import {
  actionWhenFoundUrl,
  handleMessageConvert,
  handleMessageLink,
} from "./dea";
import axios from "axios";
import { botClient } from "./client";
import { buttons } from "./buttons";

const client = botClient;

client.once("ready", () => {
  function setPresence() {
    client.user?.setPresence({
      activities: [
        {
          name: "with raspi-kun",
          type: ActivityType.Playing,
          url: "https://dea.fariz.dev",
        },
      ],
      status: "idle",
    });
  }
  setPresence();
  setInterval(setPresence, 3600000); // every 1 hour

  console.info("Remove Cache File");
  removeCacheFiles();

  console.info("Discord bot is ready! 🤖");

  async function pushToUptime() {
    if (!config.UPTIME_API_URL) return null;
    await axios.get(config.UPTIME_API_URL);
  }

  if (config.UPTIME_API_URL) {
    setInterval(pushToUptime, 60000); // every 1 minute
  }
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    const commandInteraction = interaction as CommandInteraction;
    const { commandName } = commandInteraction;

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(
        commandInteraction,
      );
    }
  } else if (interaction.isButton()) {
    const buttonInteraction = interaction as ButtonInteraction;
    const { customId } = buttonInteraction;

    if (buttons[kebabToCamel(customId) as keyof typeof buttons]) {
      buttons[kebabToCamel(customId) as keyof typeof buttons].execute(
        buttonInteraction,
      );
    }
  }
});

client.on("messageCreate", async (message: Message) => {
  // Ignore messages sent by dea
  if (client.user?.id && message.author.id === client.user.id) return;

  // action if dea mentioned
  if (client.user && message.mentions.has(client.user.id)) {
    const tagString = `<@${config.DISCORD_CLIENT_ID}>`;
    const content = message.content.replace(tagString, "").trim();

    if (content.split(" ")?.[0]?.toLowerCase() === "convert") {
      await handleMessageConvert(message, content);
    } else {
      const repliedId = message?.reference?.messageId ?? null;
      if (repliedId) {
        const msg = await message.channel.messages.fetch(repliedId);
        await handleMessageLink(msg, msg.content);
      }

      await handleMessageLink(message, message.content);
    }
  } else {
    await actionWhenFoundUrl(message);
  }

  // message from master
  if (message.author.id === config.MASTER_ID) {
    if (message.content === "dea server count") {
      message.reply(`Dea is in ${client.guilds.cache.size} servers.`);
    } else if (message.content === "dea server list") {
      let msg = "";
      client.guilds.cache.forEach((guild) => {
        msg = msg + `- ${guild.name} ${inlineCode(guild.id)}\n`;
      });

      message.reply(msg);
    }
  }
});

client.login(config.DISCORD_TOKEN);
