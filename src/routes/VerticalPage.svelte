<script lang="ts">
    import type { Snippet } from "svelte";

    let { children }: { children?: Snippet } = $props();
</script>

<div class="vertical-page">
    <div class="card">
        {@render children?.()}
    </div>
</div>

<style>
    .vertical-page {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        box-sizing: border-box;
    }
    .card {
        box-sizing: border-box;
        padding: 35px;
        height: max(100px, 100%);
        width: 100%;
    }

    @media (width > 500px) {
        .vertical-page {
            padding: 10px;
        }

        .card {
            height: min(600px, max(100px, 100%));
            width: min(500px, max(100px, 100dvw));

            border-radius: var(--bdrad);

            background-color: color-mix(in srgb, var(--fg), transparent 90%);
        }
    }
</style>
