<script lang="ts">
  import { Router } from "@roxi/routify";
  import routes from "../.routify/routes.default.js";
  import { inject } from '@vercel/analytics';

  inject({ mode: import.meta.env.MODE })
  console.log(`MODE: ${import.meta.env.MODE}`)
</script>

<Router {routes} />