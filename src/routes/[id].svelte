<script lang="ts">
  import { goto, url, params } from "@roxi/routify";
  import { onMount } from "svelte";
  import {
    Dialog,
    DialogOverlay,
    DialogTitle,
    DialogDescription,
  } from "@rgossiaux/svelte-headlessui";
  import { formatDate } from "@/helpers.ts";
  import PocketBase from "pocketbase";

  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

  export let id;
  let isOpen = true;
  let data = null;

  const fetchData = async () => {
    const payload = await pb.collection("devsign_discord_messages").getOne(id, {
      expand: "tags",
    });

    console.log(payload);
    data = payload;
  };

  onMount(fetchData);

  const closeModal = () => {
    isOpen = false;
    const p = { ...$params };
    delete p.id;
    $goto("/", p);
  };
</script>

<Dialog
  open={isOpen}
  on:close={closeModal}
  class="fixed w-screen h-screen py-20 top-0 left-0 flex items-center justify-center z-30"
>
  <DialogOverlay class="w-screen h-screen bg-black/30 absolute z-40" />

  <div class="container max-w-xl z-50 overflow-y-auto">
    <div
      class="px-8 py-4 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
    >
      {#if data}
        <div class="flex min-w-0 gap-x-4 w-full items-center">
          <img
            class="h-16 w-16 flex-none rounded-full bg-gray-50 hidden sm:block"
            src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
              data.sender,
            )}`}
            alt={data.sender}
          />
          <div class="min-w-0 flex-1">
            <div class="flex gap-2 flex-wrap items-center justify-between">
              <DialogTitle class="font-semibold leading-6 text-gray-900">
                {data.sender === '' ? 'Unknown' : data.sender}
              </DialogTitle>
              <time
                class="leading-5 text-gray-500"
                datetime={data.message_updated_at}
              >
                {formatDate(data.message_updated_at)}
              </time>
            </div>
            <div class="flex items-center gap-1 flex-wrap mt-2">
              {#each data.expand?.tags ?? [] as tag}
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
        <DialogDescription
          class="mt-3 border border-gray-200 bg-gray-100 p-2 rounded-md text-sm"
        >
          {@html data.message}
        </DialogDescription>

        <div class="mt-3 text-sm mx-1">
          <p class="font-bold">Links:</p>
          <ul class="list-disc mx-4 space-y-1">
            {#each [...new Set(data.links)] ?? [] as link}
            <li>
              <a href={link} class="hover:underline" target="_blank">
                {link}
              </a>
            </li>
            {/each}
          </ul>
        </div>

        <div class="mt-3 flex items-center justify-end gap-2">
          <a href={data.url} class="btn text-xs" target="_blank">
            Goto Message!
          </a>
        </div>
      {/if}
    </div>
  </div>
</Dialog>
