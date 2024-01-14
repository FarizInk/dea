<script lang="ts">
  import { goto } from "@roxi/routify";
  import { Avatar } from "bits-ui";
  import { DropdownMenu } from "bits-ui";
  import { pb } from "@/helpers.js";
  import { user } from "@/store.js";
  import {
    UserCircle,
    GearSix,
    SignOut,
    CirclesThree,
    DotOutline,
    Command,
    ArrowFatUp,
  } from "phosphor-svelte";
  import { flyAndScale } from "@/utils/transitions.js";

  const logout = () => {
    pb.authStore.clear();
    user.set(null);
  };

  let isOpen = false;
</script>

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
          src={$user.avatar}
          alt={$user.username}
          class="rounded-full"
        />
        <Avatar.Fallback class="border border-muted">?</Avatar.Fallback>
      </div>
    </Avatar.Root>
    <span
      class="font-bold text-md {isOpen ? "opacity-100" : "opacity-60"} group-hover:opacity-100 hidden md:inline-block"
    >
      {$user.username}
    </span>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    class="w-full max-w-[229px] rounded-xl border border-muted bg-background px-1 py-1.5 shadow-popover z-10"
    sideOffset={8}
    transition={flyAndScale}
  >
    <DropdownMenu.Item
      class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
      on:click={$goto("/")}
    >
      <div class="flex items-center">
        <CirclesThree weight="duotone" class="mr-2 text-foreground-alt sq-5" />
        Guilds
      </div>
      <div class="ml-auto flex items-center gap-px">
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <Command class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <ArrowFatUp class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-[10px] text-muted-foreground shadow-kbd sq-5"
        >
          G
        </kbd>
      </div>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
    >
      <div class="flex items-center">
        <UserCircle weight="duotone" class="mr-2 text-foreground-alt sq-5" />
        Profile
      </div>
      <div class="ml-auto flex items-center gap-px">
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <Command class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <ArrowFatUp class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-[10px] text-muted-foreground shadow-kbd sq-5"
        >
          P
        </kbd>
      </div>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-muted"
    >
      <div class="flex items-center">
        <GearSix weight="duotone" class="mr-2 text-foreground-alt sq-5" />
        Settings
      </div>
      <div class="ml-auto flex items-center gap-px">
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <Command class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-xs text-muted-foreground shadow-kbd sq-5"
        >
          <ArrowFatUp class="w-3 h-3" />
        </kbd>
        <kbd
          class="inline-flex items-center justify-center rounded-button border border-dark-10 bg-background text-[10px] text-muted-foreground shadow-kbd sq-5"
        >
          S
        </kbd>
      </div>
    </DropdownMenu.Item>
    <DropdownMenu.Separator class="-mx-1 my-1 block h-px bg-muted" />
    <DropdownMenu.Item
      class="flex h-10 select-none cursor-pointer items-center rounded-button py-3 pl-3 pr-1.5 text-sm font-medium !ring-0 !ring-transparent data-[highlighted]:bg-red-500 text-red-500 hover:text-white group"
      on:click={logout}
    >
      <div class="flex items-center">
        <SignOut
          weight="duotone"
          class="mr-2 text-red-500 group-hover:text-white sq-5"
        />
        Sign Out
      </div>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
