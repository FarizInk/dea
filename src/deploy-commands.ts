import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: null|string;
};

export async function deployCommands({ guildId = null }: DeployCommandsProps) {
  try {
    console.info("Started refreshing application (/) commands.");

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
        {
          body: commandsData,
        }
      );
    } else {
      await rest.put(
        Routes.applicationCommands(config.DISCORD_CLIENT_ID),
        {
          body: commandsData,
        }
      )
    }

    console.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}