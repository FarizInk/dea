<script lang="ts">
  import { params, goto, url } from "@roxi/routify";
  import { formatDate, pb, modificateMsgLink } from "@/helpers.js";
  import { MagnifyingGlass, Robot } from "phosphor-svelte";
  import { onMount } from "svelte";
  import { payload } from "@/store.js";

  let lastPBQuery = null;
  let query: string | null = null;
  let perPage: number = 15;
  let isLoading: boolean = false;

  onMount(() => {
    query = $params.q ?? null;
  });

  $: fetchData($params);

  const fetchData = async (params) => {
    const queryFilter = params?.q === undefined ? null : params?.q;
    const page = params?.page === undefined ? 1 : params?.page;
    const PBQuery = queryFilter + page;
    if (lastPBQuery !== PBQuery) {
      let filterQ = `guild_id = '${params.guild_id}'`;

      if (queryFilter) {
        filterQ =
          filterQ +
          " && " +
          `(tags.name ?~ "${queryFilter}" || id = "${queryFilter}" || raw_links ~ "${queryFilter}" || message ~ "${queryFilter}" || sender ~ "${queryFilter}")`;
      }

      isLoading = true;
      lastPBQuery = PBQuery;
      const result = await pb
        .collection("dea_messages")
        .getList(page, perPage, {
          sort: "-message_updated_at",
          expand: "tags",
          filter: filterQ,
        });

      payload.set(result);
      isLoading = false;
    }
  };
</script>

<form
  on:submit|preventDefault={() =>
    $goto("/[guild_id]/messages", { page: 1, q: query })}
>
  <div class="relative mb-3 mx-2 lg:mx-0">
    <input
      class="pl-12 inline-flex h-input w-full items-center rounded-card-sm border border-border-input bg-background px-4 text-sm placeholder:text-foreground-alt/50 hover:border-dark-40"
      placeholder="type query and hit enter to search 👌"
      type="text"
      autocomplete="off"
      bind:value={query}
    />
    <MagnifyingGlass
      weight="duotone"
      class="absolute left-4 top-[14px] text-dark/30 sq-[22px]"
    />
  </div>
</form>

{#if isLoading}
  <ul
    role="list"
    class="divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden bg-background shadow-card border sm:rounded-xl"
  >
    {#each Array(perPage) as x}
      <li class="relative flex justify-between gap-x-6 px-4 py-5 sm:px-6">
        <div class="flex min-w-0 gap-x-4 flex-1">
          <div class="h-12 w-12 rounded-full bg-muted animate-pulse"></div>
          <div class="min-w-0 flex-1">
            <div class="flex gap-2 items-center mb-3">
              <div class="w-1/4 h-8 rounded-md bg-muted animate-pulse"></div>
            </div>
            <div class="space-y-2">
              <div class="w-1/2 h-4 rounded-sm bg-muted animate-pulse"></div>
              <div class="w-1/3 h-4 rounded-sm bg-muted animate-pulse"></div>
              <div class="w-2/3 h-4 rounded-sm bg-muted animate-pulse"></div>
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{:else if $payload && $payload.items.length >= 1}
  <ul
    role="list"
    class="divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden bg-background shadow-card border sm:rounded-xl"
  >
    {#each $payload.items as item}
      <li
        class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-muted sm:px-6"
      >
        <div class="flex min-w-0 gap-x-4">
          <img
            class="h-12 w-12 flex-none rounded-full bg-gray-50"
            src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
              item.sender,
            )}`}
            alt={item.sender}
          />
          <div class="min-w-0 flex-auto">
            <div class="flex gap-2 items-center flex-wrap">
              <p class="text-sm font-semibold leading-6">
                <a
                  href={$url("/[guild_id]/messages/[message_id]", {
                    message_id: item.id,
                    ...$params,
                  })}
                >
                  <span class="absolute inset-x-0 -top-px bottom-0"></span>
                  {item.sender}
                </a>
              </p>
              {#if item.is_bot}
              <div class="inline-flex gap-1 flex-wrap">
                <Robot 
                weight="duotone"
                class="sq-5 text-sky-500"
                />
              </div>
              {/if}
            </div>
            <p class="mt-1 text-xs text-gray-500 line-clamp-3">
              {@html modificateMsgLink(item.message, item.raw_links)}
            </p>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-x-4">
          <div class="hidden sm:flex sm:flex-col sm:items-end">
            <div class="inline-flex gap-1 flex-wrap">
              {#each item.expand?.tags ?? [] as tag}
                <button
                  type="button"
                  class="inline-flex items-center rounded-md bg-background border px-2 py-1 text-xs font-medium z-10"
                >
                  {tag.name}
                </button>
              {/each}
            </div>
            <time
              class="mt-1 text-xs leading-5 text-gray-500"
              datetime={item.message_updated_at}
              >{formatDate(item.message_updated_at)}</time
            >
          </div>
        </div>
      </li>
    {/each}
  </ul>
{:else}
  no data.
{/if}

<div class="flex items-center justify-between flex-wrap gap-2 my-6">
  <div>
    <p class="text-sm">
      Page: {$payload?.page ?? 0} of {$payload?.totalPages ?? 0}, Showing
      <span class="font-medium">{$payload?.items.length ?? 0}</span>
      of
      <span class="font-medium">{$payload?.totalItems ?? 0}</span>
      results
    </p>
  </div>
  <div>
    <nav
      class="isolate inline-flex -space-x-px gap-2 rounded-md shadow-sm"
      aria-label="Pagination"
    >
      {#if $payload}
        <a
          href={$url("/[guild_id]/messages", {
            ...$params,
            page: $payload.page > 1 ? $payload.page - 1 : 1,
          })}
          on:click={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          class="inline-flex h-12 items-center justify-center rounded-input bg-dark px-[21px] text-[15px] font-semibold text-background shadow-mini hover:bg-dark/95 active:scale-98 active:transition-all"
        >
          Prev
        </a>
        <a
          href={$url("/[guild_id]/messages", {
            ...$params,
            page: $payload.page + 1,
          })}
          on:click={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          class="inline-flex h-12 items-center justify-center rounded-input bg-dark px-[21px] text-[15px] font-semibold text-background shadow-mini hover:bg-dark/95 active:scale-98 active:transition-all"
        >
          Next
        </a>
      {/if}
    </nav>
  </div>
</div>
<slot />
