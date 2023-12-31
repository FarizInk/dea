<script lang="ts">
  import PocketBase from "pocketbase";
  import { onMount } from "svelte";
  import { goto, url, params } from "@roxi/routify";
  import { formatDate } from "@/helpers.ts";

  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
  let user = null;
  let query: undefined | string = $params.q;
  let isLoadingList = false;
  let messages = [];
  let perPage = 10;
  let currentPage = $params.page;
  let totalFetchData = 0;
  let totalPage = 0;
  let lastPBQuery = null;

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
    await pb.collection("users").authWithOAuth2({ provider: "discord" });

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

  $: fetchData($params);

  const fetchData = async (params) => {
    const queryFilter = params?.q ?? query ?? null;
    const page = params?.page ?? currentPage ?? 1;
    const PBQuery = queryFilter + page;
    if (lastPBQuery !== PBQuery) {
      lastPBQuery = PBQuery;
      isLoadingList = true;
      // window.scrollTo({ top: 0 });
      const payload = await pb
        .collection("devsign_discord_messages")
        .getList(page, perPage, {
          sort: "-message_updated_at",
          expand: "tags",
          filter: queryFilter
            ? `tags.name ?~ "${queryFilter}" || id = "${queryFilter}" || links ~ "${queryFilter}" || message ~ "${queryFilter}" || sender ~ "${queryFilter}"`
            : null,
        });

      messages = payload.items;
      totalFetchData = payload.totalItems;
      totalPage = payload.totalPages;
      currentPage = payload.page;
      isLoadingList = false;
      // console.log(payload);
    }
  };

  const generatePreviewLinks = (links: Array<string>) => {
    let data: Array<{ url: string; name: string }> = [];
    [...new Set(links)].forEach((link) =>
      data.push({
        url: link,
        name: new URL(link).hostname ?? null,
      }),
    );
    return data;
  };

  const nextPageUrl = () => {
    return $url("/", { ...params, page: currentPage + 1 });
  };

  const prevPageUrl = () => {
    if (currentPage > 1) {
      return $url("/", { ...params, page: currentPage - 1 });
    } else {
      return $url("/", { ...params, page: 1 });
    }
  };
</script>

<div class="container mx-auto max-w-4xl p-10">
  <a href={$url("/")}>
    <h1 class="text-center text-4xl">
      <span class="font-bold">Dea</span>vsign
    </h1>
  </a>
  <div class="flex items-center justify-center flex-wrap gap-2 mt-10">
    {#if user}
      <form
        on:submit|preventDefault={$goto("/", { page: 1, q: query })}
        class="flex-auto"
      >
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

  {#if user}
    <div class="mt-6">
      {#if isLoadingList}
        Loading...
      {:else if messages.length >= 1}
        <ul class="space-y-5">
          {#each messages as message}
            <li
              class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 border-black border-2 rounded-md hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white"
            >
              <div class="flex min-w-0 gap-x-4 w-full">
                <img
                  class="h-12 w-12 flex-none rounded-full bg-gray-50 hidden sm:block"
                  src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
                    message.sender,
                  )}`}
                  alt={message.sender}
                />
                <div class="min-w-0 flex-1">
                  <div
                    class="flex flex-wrap gap-x-2 items-center justify-between"
                  >
                    <p class="text-sm font-semibold leading-6 text-gray-900">
                      <a href={$url("/[id]", { id: message.id, ...$params })}>
                        <span class="absolute inset-x-0 -top-px bottom-0"
                        ></span>
                        {message.sender === "" ? "Unknown" : message.sender}
                      </a>
                    </p>
                    <time
                      class="text-xs leading-5 text-gray-500"
                      datetime={message.message_updated_at}
                    >
                      {formatDate(message.message_updated_at)}
                    </time>
                  </div>

                  <div
                    class="text-xs text-gray-500 line-clamp-3 mb-4 sm:mb-2 mt-2 sm:mt-0"
                  >
                    {message.message}
                  </div>

                  <div class="flex gap-1 flex-wrap">
                    {#each generatePreviewLinks(message.links) as link}
                      <a
                        href={link.url}
                        class="text-xs relative truncate hover:underline btn p-1 border-0.5 block"
                        target="_blank"
                      >
                        {link.name}
                      </a>
                    {/each}
                    {#each message.expand?.tags ?? [] as tag}
                      <button
                        type="button"
                        class="text-xs relative truncate hover:underline btn p-1 border-0.5 block bg-neo-pink-200 active:bg-neo-pink-300 hover:bg-neo-pink-300"
                      >
                        {tag.name}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        no messages found.
      {/if}

      <div class="flex items-center justify-between flex-wrap gap-2 mt-6">
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
            <a
              href={$url("/", {
                ...$params,
                page: currentPage > 1 ? currentPage - 1 : 1,
              })}
              class="relative btn py-1"
            >
              Prev
            </a>
            <a
              href={$url("/", { ...$params, page: currentPage + 1 })}
              class="relative btn py-1"
            >
              Next
            </a>
          </nav>
        </div>
      </div>
    </div>
  {/if}
</div>

<slot />
