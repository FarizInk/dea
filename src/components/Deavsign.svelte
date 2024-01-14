<script lang="ts">
  import { url } from "@roxi/routify";

  export let titleClass: string = 'text-4xl'
</script>

<a href={$url("/")}>
  <h1 class="text-center {titleClass} font-semibold group">
    Dea<span class="opacity-50 group-hover:opacity-100 hidden md:inline-block">vsign</span>
  </h1>
</a>
