<script lang="ts">
  import { url } from "@roxi/routify";
  import { guilds } from "@/store.js";
</script>

<div class="flex flex-wrap gap-2">
  {#each $guilds as guild}
    <a
      href={$url("/[guild_id]", { guild_id: guild.id })}
      class="inline-flex h-12 items-center justify-center rounded-input bg-dark px-[21px] text-[15px] font-semibold text-background shadow-mini hover:bg-dark/95 active:scale-98 active:transition-all"
    >
      {guild.name ?? "-"}
    </a>
  {/each}
</div>
