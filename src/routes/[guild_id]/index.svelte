<script lang="ts">
  import { onMount } from "svelte";
  import { params } from "@roxi/routify";
  import { clasement } from "@/store.js";
  import { pb } from "@/helpers.js";
  import axios from "axios";
  import { FlyingSaucer } from "phosphor-svelte";

  let discordUsers = [];
  let isLoading = false;

  onMount(async () => {
    // isLoading = true;
    // clasement.set([]);
    // discordUsers = [];
    // let loop: boolean = true;
    // while (loop) {
    //   const query: string = discordUsers
    //     .map((user) => `&& discord_user_id != '${user.discord_user_id}'`)
    //     .join(" ");
    //   const result = await pb
    //     .collection("dea_messages")
    //     .getFirstListItem(
    //       `is_bot = false && discord_user_id != '' && guild_id = '${$params.guild_id}' ${query}`,
    //     )
    //     .catch((err) => {
    //       console.log(err);
    //       loop = false;
    //     });
    //   if (loop) {
    //     const payload = await pb
    //       .collection("dea_messages")
    //       .getList(1, 1, {
    //         filter: `discord_user_id = '${result.discord_user_id}' && guild_id = '${$params.guild_id}' ${query}`,
    //       });
    //     discordUsers.push({
    //       count: payload.totalItems,
    //       ...result,
    //     });
    //   }
    //   // loop = false;
    // }
    // clasement.set(discordUsers.sort((a, b) => b.count - a.count));
    // isLoading = false;
  });
</script>

<div class="flex items-center justify-center mb-10">
  <div class="flex flex-col items-center justify-center min-h-[50vh]">
    <FlyingSaucer weight="duotone" class="sq-28" />
    <p class="text-foreground/50 font-mono">this page is WIP, click server name (top navigation) for more detail.</p>
  </div>
  {#if isLoading}
    loading...
  {:else}
    <ul
      role="list"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {#each $clasement as user}
        <li
          class="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div class="flex w-full items-center justify-between space-x-6 p-6">
            <div class="flex-1 truncate">
              <div class="flex items-center space-x-3">
                <h3 class="truncate text-sm font-medium text-gray-900">
                  {user.sender}
                </h3>
                <span
                  class="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                  >Verified</span
                >
              </div>
              <p class="mt-1 truncate text-sm text-gray-500">
                {user.count} messages
              </p>
            </div>
            <img
              class="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
              src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
                user.sender,
              )}`}
              alt={user.sender}
            />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
