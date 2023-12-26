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
