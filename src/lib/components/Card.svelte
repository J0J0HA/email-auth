<script>
    let { children = null } = $props();
</script>

<div class="card">
    {@render children?.()}
</div>

<style>
    .card {
        width: var(---w, fit-content);
        height: var(---h, fit-content);

        padding: var(---y, 50px) var(---x, 35px);
        border-radius: 5px;

        background-color: color-mix(in srgb, var(--fg), transparent 90%);
    }
</style>
