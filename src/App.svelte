<script lang="ts">
  import { Router } from "@roxi/routify";
  import routes from "../.routify/routes.default.js";
  import { Toaster } from 'svelte-sonner'
</script>

<Toaster richColors position="bottom-center" />
<Router {routes} />