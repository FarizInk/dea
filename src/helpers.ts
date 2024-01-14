import PocketBase from "pocketbase";
import axios from "axios";
import { guilds, payload, user } from "./store.js";
import { get } from "svelte/store";
import { toast } from "svelte-sonner";

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export const formatDate = (datetime: string) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const data = new Date(datetime);
  if (today === data.setHours(0, 0, 0, 0)) {
    return (
      "Today, " +
      new Date(datetime).toLocaleTimeString("en-US", {
        hour12: false,
      })
    );
  } else {
    return new Date(datetime).toLocaleString("en-US", {
      hour12: false,
    });
  }
};

export const modificateMsgLink = (message: string, links: Array<string>) => {
  let result = message;
  [...new Set(links)].forEach((link) => {
    result = result.replaceAll(
      link,
      `<a href="${link}" class="custom-link" target="_blank">${new URL(link).hostname }</a>`,
    );
  });
  return result;
};

export const updateUserPBGuild = async () => {
  const storeUser = get(user) ?? null;
  const storeGuilds = get(guilds) ?? null;
  if (storeUser && storeGuilds) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await pb.collection("dea_users").update(storeUser.id, {
          guilds_id: storeGuilds.map((guild) => guild.id),
          // guilds: ["RELATION_RECORD_ID"],
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    toast.promise(promise, {
      loading: `Update Guild ${storeUser.username}...`,
      success: () => {
        user.set(pb.authStore.model);
        
        return `Guild ${storeUser.username} updated.`;
      },
      error: "Error... :( Try again!",
    });
  }
};

export const getGuilds = async () => {
  const storeUser = get(user) ?? null;
  const storeGuilds = get(guilds) ?? null;
  if (storeUser && storeGuilds.length === 0) {
    const promise = new Promise((resolve, reject) =>
      axios.get(
        "https://discord.com/api/users/@me/guilds",
        {
          headers: {
            authorization: `Bearer ${storeUser.access_token ?? null}`,
          },
        },
      )
        .then((res) => resolve(res.data))
        .catch((error) => reject(error))
    );

    toast.promise(promise, {
      loading: "Getting guilds...",
      success: (data) => {
        const modifiedData = data?.map((item) => ({
          ...item,
          icon_url: `https://cdn.discordapp.com/icons/${item.id}/${item.icon}.png`
        }));
        
        guilds.set(modifiedData);
        updateUserPBGuild();
        return `${modifiedData.length} guild found.`;
      },
      error: (err) => {
        setTimeout(getGuilds, 1000)
        return "Error... :( Try again!"
      },
      // finally: async () => {
      // },
    });
  }
};

export const fetchMessages = async (params) => {
  let query = null;
  if (params.guild_id) {
    query = `guild_id = '${params.guild_id}'`;
  }
  if (params.q) {
    query = query +
      ` && tags.name ?~ "${params.q}" || id = "${params.q}" || raw_links ~ "${params.q}" || message ~ "${params.q}" || sender ~ "${params.q}"`;
  }

  const result = await pb
    .collection("dea_messages")
    .getList(1, 15, {
      sort: "-message_updated_at",
      expand: "tags",
      filter: query,
    });
  payload.set(result);
  console.log(result);
};
