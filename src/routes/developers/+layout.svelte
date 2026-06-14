<script lang="ts">
    import type { Snippet } from "svelte";
    import ModerationLayout from "../ModerationLayout.svelte";
    import type { LayoutServerData } from "./$types";

    let { children, data }: { children: Snippet; data: LayoutServerData } =
        $props();
</script>

<ModerationLayout user={data.user}>
    {@render children?.()}
</ModerationLayout>
