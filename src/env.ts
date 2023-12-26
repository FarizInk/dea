import { config as dotenv } from 'dotenv';

dotenv();

const {
  // DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
} = process.env;

// if (!DISCORD_CLIENT_ID) throw new Error('DISCORD_CLIENT_ID is not set');
if (!DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not set');

type Env = {
  // DISCORD_CLIENT_ID: string;
  DISCORD_TOKEN: string;
}

const env: Env = {
  // DISCORD_CLIENT_ID,
  DISCORD_TOKEN,
};

export default env;
