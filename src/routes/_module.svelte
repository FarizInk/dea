<script lang="ts">
  import { onMount } from "svelte";
  import { pb } from "@/helpers.js";
  import { user } from "@/store.js";
  import { Button } from "bits-ui";
  import { DiscordLogo } from "phosphor-svelte";
  import Deavsign from "@/components/Deavsign.svelte";
  import ParentNavigation from "@/components/navigations/ParentNavigation.svelte"

  onMount(async () => {
    if (import.meta.env.DEV) document.body.className += "debug-screens ";

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }

    if (pb.authStore.isValid) {
      user.set(pb.authStore.model);
    }
  });

  const login = async () => {
    const result = await pb.collection("dea_users").authWithOAuth2({
      provider: "discord",
      scopes: ["identify", "email", "guilds"],
    });

    if (pb.authStore.isValid) {
      await pb.collection("dea_users").update(result.record.id, {
        user_id: result.meta?.id ?? null,
        name: result.meta?.name ?? null,
        avatar: result.meta?.avatarUrl ?? null,
        access_token: result.meta?.accessToken ?? null,
        refresh_token: result.meta?.refreshToken ?? null,
        token_expired_at: result.meta?.expiry ?? null,
      });
      user.set(pb.authStore.model);
    }
  };
</script>

<div
  class="container mx-auto max-w-4xl min-h-screen {!$user
    ? 'flex flex-col items-center justify-center'
    : 'pt-20'}"
>
  {#if $user}
    <ParentNavigation />
    <slot />
  {:else}
    <div class="my-4">
      <Deavsign />
    </div>
    <div class="flex items-center justify-center">
      <Button.Root
        on:click={login}
        class="inline-flex gap-2 h-12 items-center justify-center rounded-input bg-dark px-[21px] text-[15px] font-semibold text-background shadow-mini hover:bg-dark/95 active:scale-98 active:transition-all"
      >
        Sign In <DiscordLogo weight="duotone" class="h-6 w-6" />
      </Button.Root>
    </div>
  {/if}
</div>
