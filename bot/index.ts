import env from './env.js';
import log from './log.js';
import client from './discord.js';


process.on('SIGTERM', () => log.info('Received SIGTERM'));

process.on('SIGINT', () => log.info('Received SIGINT'));

process.on('unhandledRejection', (error) => {
  if (error instanceof Error) log.warn(`Uncaught ${error.name}`);
  log.error(error);
});

log.info('Connecting to Discord...');
client.login(env.DISCORD_TOKEN);
