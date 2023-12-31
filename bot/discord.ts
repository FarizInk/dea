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
import { understandMsg } from "./dea.js";
import * as fs from 'fs';

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
    const quotes = JSON.parse(fs.readFileSync('./quotes.json', { encoding: 'utf8' }));
    const selectedQuote = quotes[Math.floor(Math.random() * (quotes.length - 1))];
    client.user.setActivity({
      name: `Your Bacod`,
      state: selectedQuote,
      type: ActivityType.Listening,
    });
  }
  setPresence();
  setInterval(setPresence, ms("1h"));
});

client.on("messageCreate", async (message: Message) => understandMsg(message, client));

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
