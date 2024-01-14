<script lang="ts">
  import { params } from "@roxi/routify";
  import { guilds } from "@/store.js";
  import { pb } from "@/helpers.js";
  

  $: fetchData($params);

  const fetchData = async (params) => {
    query = params?.q ?? null;
    const queryFilter = params?.q === undefined ? null : params?.q;
    const page = params?.page === undefined ? 1 : params?.page;
    const PBQuery = queryFilter + page;
    if (lastPBQuery !== PBQuery) {
      // window.scrollTo({ top: 0 });
      const payload = await pb
        .collection("dea_messages")
        .getList(page, perPage, {
          sort: "-message_updated_at",
          expand: "tags",
          filter: queryFilter
            ? `tags.name ?~ "${queryFilter}" || id = "${queryFilter}" || raw_links ~ "${queryFilter}" || message ~ "${queryFilter}" || sender ~ "${queryFilter}"`
            : null,
        });
      // console.log(payload);
    }
  };
</script>

list links here...
<slot/>