<script lang="ts">
  import { Message } from "discord.js";

  import PocketBase from "pocketbase";
  import { onMount } from "svelte";

  const pb = new PocketBase("https://pb.fariz.dev");
  const today = new Date().setHours(0, 0, 0, 0);
  let user = null;

  onMount(async () => {
    if (import.meta.env.DEV) document.body.className += "debug-screens ";

    const BGs = [
      "bg-violet-200",
      "bg-pink-200",
      "bg-orange-200",
      "bg-cyan-200",
    ];
    document.body.className += BGs[Math.floor(Math.random() * BGs.length)];

    if (pb.authStore.isValid) {
      user = pb.authStore.model;
      await fetchData();
    }
  });

  const login = async () => {
    const authData = await pb
      .collection("users")
      .authWithOAuth2({ provider: "discord" });

    if (pb.authStore.isValid) {
      user = pb.authStore.model;
      await fetchData();
    }
  };

  const logout = () => {
    pb.authStore.clear();
    user = null;
    messages = [];
  };

  let query = null;
  let messages = [];
  let perPage = 10;
  let currentPage = 1;
  let totalFetchData = 0;
  let totalPage = 0;
  const fetchData = async (state: "prev" | "next" | null = null) => {
    if (state === "next") {
      currentPage++;
    } else if (state === "prev") {
      currentPage--;
    }

    const payload = await pb
      .collection("devsign_discord_links")
      .getList(currentPage, perPage, {
        sort: "-message_updated_at",
        expand: "tags",
        filter: query ? `links ~ "${query}" || message ~ "${query}" || sender ~ "${query}"` : null
      });

    messages = payload.items;
    totalFetchData = payload.totalItems;
    totalPage = payload.totalPages;
    currentPage = payload.page;
  };

  const formatDate = (datetime: string) => {
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
</script>

<div class="container mx-auto max-w-4xl p-10">
  <h1 class="text-center text-4xl"><span class="font-bold">Dea</span>vsign</h1>
  <div class="flex items-center justify-center gap-2 mt-10">
    {#if user}
      <form on:submit|preventDefault={fetchData} class="flex-1">
        <input
          class="input w-full"
          placeholder="type query and hit enter to search 👌"
          bind:value={query}
        />
      </form>
      <button
        type="button"
        class="btn bg-neo-red-200 hover:bg-neo-red-400 active:bg-neo-red-400"
        on:click={logout}
      >
        Logout <span class="font-bold ml-1">{user.username}</span>
      </button>
    {:else}
      <button type="button" class="btn" on:click={login}>
        Login with <span class="font-bold ml-2">Discord</span>
      </button>
    {/if}
  </div>

  <div class="mt-6">
    <ul class="space-y-5">
      {#each messages as message, i}
        <li
          class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 border-black border-2 rounded-md hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white"
        >
          <div class="flex min-w-0 gap-x-4">
            <img
              class="h-12 w-12 flex-none rounded-full bg-gray-50"
              src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
                message.sender,
              )}`}
              alt={message.sender}
            />
            <div class="min-w-0 flex-auto">
              <p class="text-sm font-semibold leading-6 text-gray-900">
                <a href="#">
                  <span class="absolute inset-x-0 -top-px bottom-0"></span>
                  {message.sender}
                </a>
              </p>

              <div class="flex gap-1 flex-wrap">
                {#each message.links ?? [] as link}
                  <a
                    href={link}
                    class="text-xs relative truncate hover:underline btn p-1 border-0.5 block"
                  >
                    {link}
                  </a>
                {/each}
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-x-4">
            <div class="hidden sm:flex sm:flex-col sm:items-end">
              <div class="flex gap-1">
                {#each message.expand?.tags ?? [] as tag}
                  <button
                    type="button"
                    class="text-xs relative truncate hover:underline btn p-1 border-0.5 block"
                  >
                    {tag.name}
                  </button>
                {/each}
              </div>
              <time
                class="mt-1 text-xs leading-5 text-gray-500"
                datetime={message.message_updated_at}
              >
                {formatDate(message.message_updated_at)}
              </time>
            </div>
          </div>
        </li>
      {/each}
    </ul>

    {#if user}
      <div class="sm:flex sm:flex-1 sm:items-center sm:justify-between mt-6">
        <div>
          <p class="text-sm text-gray-700">
            Page: {currentPage} of {totalPage}, Showing
            <span class="font-medium">{perPage}</span>
            of
            <span class="font-medium">{totalFetchData}</span>
            results
          </p>
        </div>
        <div>
          <nav
            class="isolate inline-flex -space-x-px gap-2 rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              type="button"
              on:click={async () => await fetchData("prev")}
              class="relative btn py-1"
            >
              Prev
            </button>
            <button
              type="button"
              on:click={async () => await fetchData("next")}
              class="relative btn py-1"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    {/if}
  </div>
</div>
