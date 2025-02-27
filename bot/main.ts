import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { ActivityType, IntentsBitField } from "discord.js";
import { Client } from "discordx";
import "dotenv/config"
import { handlerLink } from "./dea.js";
import ms from "ms";
import * as fs from 'fs';
import * as path from 'path';

const botToken = process.env.BOT_TOKEN ?? null

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: process.env.DEBUG ? process.env.DEBUG.toLowerCase() === 'false' : true,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: ["~", "~!"],
  },
});

bot.once("ready", async () => {
  await bot.clearApplicationCommands();

  // Make sure all guilds are cached
  await bot.guilds.fetch();


  // Synchronize applications commands with Discord
  void bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  // await bot.clearApplicationCommands(
  //   ...bot.guilds.cache.map((g) => g.id)
  // );

  function setPresence() {
    bot.user?.setPresence({
      activities: [{
        name: `with raspi-kun`,
        type: ActivityType.Playing,
        url: 'https://dea.fariz.dev',
      }],
      status: 'idle',
    })
  }
  setPresence();
  setInterval(setPresence, ms("1h"));

  console.info("Remove Cache File");
  fs.readdir('./cache', (err, files) => {
    if (err) {
      console.error(err);
    }

    files.forEach(file => {
      const fileDir = path.join('./cache', file);

      if (file !== '.gitignore') {
        fs.unlinkSync(fileDir);
      }
    });
  });

  console.info("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", async (message: Message) => {
  await handlerLink(message, bot);
  if (bot.user && message.mentions.has(bot.user.id)) {
    const repliedId = message?.reference?.messageId ?? null
    if (repliedId) {
      const msg = await message.channel.messages.fetch(repliedId);
      await handlerLink(msg, bot);
    }
  }

  void bot.executeCommand(message);
});

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Let's start the bot
  if (!botToken) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }

  // Log in with your bot token
  await bot.login(botToken);
}

void run();
