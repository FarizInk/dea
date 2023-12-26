// eslint-disable-next-line import/no-extraneous-dependencies
import ms from "ms";
import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Message,
  PartialMessage,
} from "discord.js";
import log from "./log.js";
import { codeBlock } from "discord.js";
import env from "./env.js";

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// eslint-disable-next-line no-shadow
client.once("ready", (client) => {
  log.success("Connected to Discord as", client.user.tag);
  function setPresence() {
    client.user.setActivity({
      name: `Your Bacod`,
      state: "this is quote",
      url: "https://fariz.dev",
      type: ActivityType.Listening,
    });
  }
  setPresence();
  setInterval(setPresence, ms("1h"));
});

client.on("messageCreate", async (message: Message) => {
  const msgHttp : Array<string> = message.toString().match(/\bhttp?:\/\/\S+/gi) ?? []
  const msgHttps : Array<string> = message.toString().match(/\bhttps?:\/\/\S+/gi) ?? []
  const links = msgHttp.concat(msgHttps);

  if (links.length >= 1) {
    message.reply(`Found ${links.length} Link`)
    console.log(`\nid: ${message.id} \nurl: ${message.url} \nlinks: ${links.join(', ')}`);
    
    // store link
  }

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
    message.reply(`Watching ${client.guilds.cache.size} servers`);
  }
});

client.on(
  "messageUpdate",
  (
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
  ) => {
    log.info(`\nOld: ${oldMessage} \nNew: ${newMessage}`);
  },
);

export default client;
