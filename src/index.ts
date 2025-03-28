import { ActivityType, Client, CommandInteraction, GatewayIntentBits, Message, type Interaction } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { removeCacheFiles } from "./utils";
import { handleMessageLink } from "./dea";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent, // REQUIRED TO READ MESSAGE CONTENT
  ],
});

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
});

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const commandInteraction = interaction as CommandInteraction;

  const { commandName } = commandInteraction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(commandInteraction);
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
});

client.login(config.DISCORD_TOKEN);
