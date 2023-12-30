<script lang="ts">
  import PocketBase from "pocketbase";
  import { onMount } from "svelte";

  const pb = new PocketBase("https://pb.fariz.dev");
  let user = null

  onMount(() => {
    if (import.meta.env.DEV) document.body.className += "debug-screens ";

    const BGs = [
      "bg-violet-200",
      "bg-pink-200",
      "bg-orange-200",
      "bg-cyan-200",
    ];
    document.body.className += BGs[Math.floor(Math.random() * BGs.length)];

    if (pb.authStore.isValid) {
      user = pb.authStore.model
    }
  });

  const login = async () => {
    const authData = await pb
      .collection("users")
      .authWithOAuth2({ provider: "discord" });

      if (pb.authStore.isValid) {
        user = pb.authStore.model
      }
  };

  const logout = () => {
    pb.authStore.clear();
    user = null
  }

  const search = () => {
    return null;
  }
</script>

<div class="container mx-auto max-w-4xl p-10">
  <h1 class="text-center text-4xl"><span class="font-bold">Dea</span>vsign</h1>
  <div class="flex items-center justify-center gap-2 mt-10">
    {#if user}
      <input
        class="input flex-1"
        placeholder="type query and hit enter to search 👌"
      />
      <button
        type="button"
        class="btn "
        on:click={search}
      >
        Search
      </button>
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
</div>
