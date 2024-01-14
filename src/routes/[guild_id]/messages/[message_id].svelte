<script lang="ts">
  import { goto, params } from "@roxi/routify";
  import { Dialog } from "bits-ui";
  import { flyAndScale } from "@/utils/transitions.js";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { pb } from "@/helpers.js";
  import { formatDate, modificateMsgLink } from "@/helpers.js";
  import { Robot } from "phosphor-svelte";

  let dialogOpen = false;
  let data = null;

  const fetchData = async () => {
    const result = await pb
      .collection("dea_messages")
      .getOne($params.message_id, {
        expand: "tags",
      });
    data = result;
  };

  onMount(async () => {
    setTimeout(() => (dialogOpen = true), 100);
    await fetchData();
  });

  const closeDialog = () => {
    dialogOpen = false;
    setTimeout(() => {
      const p = { ...$params };
      delete p.message_id;
      $goto("/[guild_id]/messages", p);
    }, 100);
  };
</script>

<Dialog.Root bind:open={dialogOpen} onOutsideClick={() => closeDialog()}>
  <Dialog.Portal>
    <Dialog.Overlay
      transition={fade}
      transitionConfig={{ duration: 150 }}
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    />
    <Dialog.Content
      transition={flyAndScale}
      class="fixed left-[50%] top-[50%] z-50 w-full max-w-[94%] translate-x-[-50%] translate-y-[-50%] rounded-card-lg border bg-background p-5 shadow-popover outline-none sm:max-w-[490px] md:w-full"
    >
      {#if data !== null}
        <div class="flex space-x-3">
          <div class="flex-shrink-0">
            <img
              class="h-10 w-10 rounded-full"
              src={`https://ui-avatars.com/api/?background=918efa&color=fff&name=${encodeURI(
                data.sender,
              )}`}
              alt={data.sender}
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold flex items-center gap-2">
              <a href="#" class="hover:underline">{data.sender}</a>
              {#if data.is_bot}
                <div class="inline-flex gap-1 flex-wrap">
                  <Robot weight="duotone" class="sq-5 text-sky-500" />
                </div>
              {/if}
            </p>
            <p class="text-sm text-gray-500">
              <a href="#" class="hover:underline"
                >{formatDate(data.message_updated_at)}</a
              >
            </p>
          </div>
          <div class="flex flex-shrink-0 self-center">asd</div>
        </div>
        <div class="inline-flex gap-1 flex-wrap mt-2">
          {#each data.expand?.tags ?? [] as tag}
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-background border px-2 py-1 text-xs font-medium z-10"
            >
              {tag.name}
            </button>
          {/each}
        </div>

        <div class="bg-muted text-sm p-2 rounded-lg mt-3">
          {@html modificateMsgLink(data.message, data.raw_links)}
        </div>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
