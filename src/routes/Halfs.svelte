<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        first,
        second,
        firstSize,
        secondSize,
    }: {
        first?: Snippet;
        second?: Snippet;
        firstSize?: number;
        secondSize?: number;
    } = $props();
</script>

<div
    class="halfs"
    style:--first-half="{firstSize}fr"
    style:--second-half="{secondSize}fr"
>
    <div class="first half">
        {@render first?.()}
    </div>
    <div class="second half">
        {@render second?.()}
    </div>
</div>

<style>
    .halfs {
        display: grid;
        grid-template-rows: var(--first-half) var(--second-half);
        height: 100%;
        width: 100%;
    }

    .first {
        --half: var(--first-half);
    }

    .second {
        --half: var(--second-half);
    }

    .half {
        min-width: 0;
        min-height: 0;
    }
</style>
