import { config as dotenv } from 'dotenv';

dotenv();

const {
  DISCORD_TOKEN,
  GUILD_ID,
  VITE_POCKETBASE_URL,
  POCKETBASE_USER_EMAIL,
  POCKETBASE_USER_PASSWORD,
  MODE,
} = process.env;

if (!DISCORD_TOKEN) throw new Error('DISCORD_TOKEN is not set');
if (!VITE_POCKETBASE_URL) throw new Error('VITE_POCKETBASE_URL is not set');
if (!POCKETBASE_USER_EMAIL) throw new Error('POCKETBASE_USER_EMAIL is not set');
if (!POCKETBASE_USER_PASSWORD) throw new Error('POCKETBASE_USER_PASSWORD is not set');
if (!MODE) throw new Error('MODE is not set');

type Env = {
  DISCORD_TOKEN: string;
  GUILD_ID: string|undefined;
  VITE_POCKETBASE_URL: string;
  POCKETBASE_USER_EMAIL: string;
  POCKETBASE_USER_PASSWORD: string;
  MODE: string;
}

const env: Env = {
  DISCORD_TOKEN,
  GUILD_ID,
  VITE_POCKETBASE_URL,
  POCKETBASE_USER_EMAIL,
  POCKETBASE_USER_PASSWORD,
  MODE,
};

export default env;
