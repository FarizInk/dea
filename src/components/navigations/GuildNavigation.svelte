<script lang="ts">
  import { goto, params } from "@roxi/routify";
  import { Avatar } from "bits-ui";
  import { DropdownMenu } from "bits-ui";
  import { DotOutline, Link, ChatsTeardrop, House } from "phosphor-svelte";
  import { flyAndScale } from "@/utils/transitions.js";

  export let guild = null;

  let isOpen = false;
</script>

{#if guild}
  <DotOutline class="h-8 w-8 opacity-30" weight="fill" />
  <DropdownMenu.Root bind:open={isOpen}>
    <DropdownMenu.Trigger
      class="flex items-center justify-center gap-2 py-2 rounded-lg group"
    >
      <Avatar.Root
        class="h-8 w-8 rounded-full border {isOpen
          ? 'border-foreground'
          : 'border-transparent'} group-hover:border-foreground bg-muted text-[17px] font-medium uppercase text-muted-foreground"
      >
        <div
          class="flex h-full w-full items-center justify-center rounded-full border border-background"
        >
          <Avatar.Image
            src={guild.icon_url}
            alt={guild.name}
            class="rounded-full"
          />
          <Avatar.Fallback class="border border-muted">?</Avatar.Fallback>
        </div>
      </Avatar.Root>
      <span class="font-bold text-md {isOpen ? "opacity-100" : "opacity-60"} group-hover:opacity-100 hidden md:inline-block"
        >{guild.name}</span
      >
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      class="w-full max-w-[229px] rounded-xl border border-muted bg-background px-1 py-1.5 shadow-popover z-10"
      sideOffset={8}
      transition={flyAndScale}
    >
      <DropdownMenu.Item
        class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
        on:click={$goto("/[guild_id]", $params)}
      >
        <div class="flex items-center">
          <House
            weight="duotone"
            class="mr-2 text-foreground-alt sq-5"
          />
          Home
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Separator class="-mx-1 my-1 block h-px bg-muted" />
      <DropdownMenu.Item
        class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
        on:click={$goto("/[guild_id]/messages", $params)}
      >
        <div class="flex items-center">
          <ChatsTeardrop
            weight="duotone"
            class="mr-2 text-foreground-alt sq-5"
          />
          Messages
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
        on:click={$goto("/[guild_id]/links", $params)}
      >
        <div class="flex items-center">
          <Link weight="duotone" class="mr-2 text-foreground-alt sq-5" />
          Links
        </div>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
