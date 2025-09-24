import axios from 'axios';
import { downloadFile } from './utils';
import { generateEmbed } from './parser';
import { allowedUrls } from '../config';
import * as fs from 'fs';

interface Config {
  baseUrl: string;
  scrapperPath: string;
  statusPath: string;
  token: string;
}
type ConfigArray = Config[];

const configPath = './config/h.json';
const configFile = Bun.file(configPath);

export const isAllowedUrl = (link: string): boolean => {
  // Direct match with allowed URL patterns
  const directMatch = allowedUrls.some(a => link.includes(a));
  if (directMatch) return true;

  // Special case for Instagram URLs with usernames
  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^/]+\/(p|reel|stories|share)\//;
  return instagramRegex.test(link);
};

async function getScrapperConfig() {
  const isExist = await configFile.exists();
  if (!isExist) throw new Error('Please Set Config!');
  const configs: ConfigArray = await configFile.json();

  for (let i = 0; i < configs.length; i++) {
    const config: Config | undefined = configs[i];
    if (!config) continue;
    try {
      const { data } = await axios.get(`${config.baseUrl}/${config.statusPath}`);
      if (data.status === 'ok') {
        return {
          url: `${config.baseUrl}/${config.scrapperPath}`,
          token: config.token,
        };
      } else {
        continue;
      }
    } catch {
      continue;
    }
  }

  throw new Error('No Scrapper Instances active!');
}

export const basicGetter = async (url: string) => {
  const config = await getScrapperConfig();
  try {
    const { data } = await axios.post(
      config.url,
      {
        url,
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.token}`,
        },
        timeout: 60000, // 60 seconds
      }
    );

    const medias = data.medias ?? [];
    const fileName = Math.floor(Date.now() / 1000).toString();
    const files = [];
    for (let i = 0; i < medias.length; i++) {
      const mediaUrl = medias?.[i] ?? null;
      const filePath = await downloadFile(`${fileName}-${i}`, mediaUrl);
      if (filePath) files.push(filePath);
    }

    return {
      files,
      embed: generateEmbed(data),
    };
  } catch (error) {
    console.error(`error getting info: ${url}`);
    console.error(error);
    return {
      files: [],
      embed: null,
    };
  }
};

export function getLinks(message: string) {
  const msgHttp: Array<string> = message.match(/\bhttp?:\/\/\S+/gi) ?? [];
  const msgHttps: Array<string> = message.match(/\bhttps?:\/\/\S+/gi) ?? [];

  return msgHttp.concat(msgHttps);
}

export async function removeFiles(files: (string | null)[]) {
  files.forEach(file => {
    if (file) fs.unlink(file, () => null);
  });
}
