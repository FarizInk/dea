import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonInteraction, ButtonStyle, Client, GatewayIntentBits, inlineCode, Message, MessageFlags, quote, type Interaction } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { removeCacheFiles } from "./utils";
import { getLinks, handleMessageLink, isAllowedUrl } from "./dea";
import axios from "axios";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent, // REQUIRED TO READ MESSAGE CONTENT
  ],
});

client.once("clientReady", () => {
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

  // Remove Cache File
  removeCacheFiles();

  // Discord bot is ready! 🤖

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
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  } else if (interaction.isButton()) {
    const buttonInteraction = interaction as ButtonInteraction;

    if (buttonInteraction.customId === 'get-media') {
      await buttonInteraction.message.edit({
        components: []
      });

      const msgContent = buttonInteraction.message.content
      const discordLinkRegex = /https:\/\/discord\.com\/channels\/\d+\/(?<channelId>\d+)\/(?<messageId>\d+)/;
      const match = msgContent.match(discordLinkRegex);
      if (match?.groups) {
        const { channelId, messageId } = match.groups;
        if (channelId && messageId) {
          const channel = await client.channels.fetch(channelId);
          if (channel?.isTextBased()) {
            const message = await channel.messages.fetch(messageId);
            await buttonInteraction.reply({
              content: 'Wait a moment, I am getting the media...',
              flags: MessageFlags.Ephemeral,
            });
            await handleMessageLink(message, message.content, client);
          }
        }
      } else {
        await buttonInteraction.reply({
          content: "No valid Discord message link found.",
          flags: MessageFlags.Ephemeral,
        });
      }
    } else if (buttonInteraction.customId === 'no') {
      await buttonInteraction.message.edit({
        components: []
      });
      await buttonInteraction.reply({
        content: 'Ok, have a nice day!',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.on("messageCreate", async (message: Message) => {
  if (client.user && message.mentions.has(client.user.id)) {
    const repliedId = message?.reference?.messageId ?? null;
    if (repliedId) {
      const msg = await message.channel.messages.fetch(repliedId);
      await handleMessageLink(msg, msg.content, client);
    }

    await handleMessageLink(message, message.content, client);
  }

  if (message.author.id === config.MASTER_ID && message.content === "dea server count") {
    message.reply(`Dea is in ${client.guilds.cache.size} servers.`)
  } else if (message.author.id === config.MASTER_ID && message.content === "dea server list") {
    let msg = ""
    client.guilds.cache.forEach(guild => {
      msg = msg + `- ${guild.name} ${inlineCode(guild.id)}\n`
    });

    message.reply(msg)
  }

  const links = getLinks(message.content);
  let isAllowed = false;
  links.forEach((link) => {
    const result = isAllowedUrl(link)
    if (result) isAllowed = true;
  })
  if (isAllowed && !message.author.bot) {
    if (message.guild) {
      const no = new ButtonBuilder()
        .setCustomId('no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger);

      const yes = new ButtonBuilder()
        .setCustomId('get-media')
        .setLabel('Yes!')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([yes, no]);

      const link = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
      await message.author.send({
        content: `${quote(message.content)}\nWanna get media from [this message](${link})?`,
        components: [row],
      });
    } else {
      await handleMessageLink(message, message.content, client);
    }
  }
});

client.login(config.DISCORD_TOKEN);
