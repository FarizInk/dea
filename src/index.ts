import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonInteraction, CommandInteraction, inlineCode, Message, quote, type Interaction } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./utils/utils";
import { kebabToCamel, removeCacheFiles } from "./utils/utils";
import { handleMessageLink } from "./dea";
import axios from "axios";
import { getLinks, isAllowedUrl } from "./utils/scrapper";
import { botClient } from "./client";
import { buttons } from "./buttons";
import { btnGetMedia } from "./buttons/get-media";
import { btnNo } from "./buttons/no";

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
    await axios.get(config.UPTIME_API_URL)
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
      commands[commandName as keyof typeof commands].execute(commandInteraction);
    }
  } else if (interaction.isButton()) {
    const buttonInteraction = interaction as ButtonInteraction;
    const { customId } = buttonInteraction;

    if (buttons[kebabToCamel(customId) as keyof typeof buttons]) {
      buttons[kebabToCamel(customId) as keyof typeof buttons].execute(buttonInteraction);
    }
  }
});

client.on("messageCreate", async (message: Message) => {
  // Ignore messages sent by dea
  if (client.user?.id && message.author.id === client.user.id) return;

  // action if dea mentioned
  if (client.user && message.mentions.has(client.user.id)) {
    const repliedId = message?.reference?.messageId ?? null;
    if (repliedId) {
      const msg = await message.channel.messages.fetch(repliedId);
      await handleMessageLink(msg, msg.content, client);
    } else {
      await handleMessageLink(message, message.content, client);
    }
  } else {
    let links = getLinks(message.content);
    let isAllowed = false;
    links.forEach((link) => {
      const result = isAllowedUrl(link)
      if (result) isAllowed = true;
    })
    if (isAllowed && !message.author.bot) {
      if (message.guild) {
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents([btnGetMedia, btnNo]);

        const link = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
        await message.author.send({
          content: `${quote(message.content)}\nWanna get media from [this message](${link})?`,
          components: [row],
        });
      } else {
        await handleMessageLink(message, message.content, client);
      }
    }
  }

  // message from master
  if (message.author.id === config.MASTER_ID && message.content === "dea server count") {
    message.reply(`Dea is in ${client.guilds.cache.size} servers.`)
  } else if (message.author.id === config.MASTER_ID && message.content === "dea server list") {
    let msg = ""
    client.guilds.cache.forEach(guild => {
      msg = msg + `- ${guild.name} ${inlineCode(guild.id)}\n`
    });

    message.reply(msg)
  }
});

client.login(config.DISCORD_TOKEN);
