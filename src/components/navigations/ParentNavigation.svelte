<script lang="ts">
  import { params } from "@roxi/routify";
  import UserNavigation from "@/components/navigations/UserNavigation.svelte";
  import GuildNavigation from "@/components/navigations/GuildNavigation.svelte";
  import Deavsign from "@/components/Deavsign.svelte";
  import { guilds } from "@/store.js";
  import { onDestroy, onMount } from "svelte";
  import { getGuilds } from "@/helpers.js";

  let guild = null;

  guilds.subscribe((value) => {
    guild = value.find((g) => g.id === ($params.guild_id ?? null));
  });

  $: getGuild($params.guild_id ?? null);

  const getGuild = async (guildId: string | null = null) => {
    if ($guilds.length >= 1) {
      guild = $guilds.find((g) => g.id === guildId);
    } else {
      await getGuilds();
    }
  };

  const dynamicSidebarHeight = () => {
    const elem = document.querySelector("#parent-navigation");
    if (elem !== null) {
      if (window.scrollY >= 15) {
        elem.classList.remove("py-4");
        elem.classList.add(
          "bg-background/30",
          "backdrop-blur",
          "border-b",
          "py-1",
        );
      } else {
        elem.classList.remove(
          "bg-background/30",
          "backdrop-blur",
          "border-b",
          "py-1",
        );
        elem.classList.add("py-4");
      }
    }
  };

  onMount(() => {
    document.addEventListener("scroll", dynamicSidebarHeight);

    return () => {
      window.removeEventListener("scroll", dynamicSidebarHeight);
    };
  });
</script>

<div
  id="parent-navigation"
  class="flex items-center justify-center py-4 fixed w-screen top-0 left-0 z-20 transition-all"
>
  <Deavsign titleClass="text-2xl" />
  <UserNavigation />
  <GuildNavigation {guild} />
</div>
