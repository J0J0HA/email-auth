<script lang="ts">
    import { LoadDefaultTheme } from "jxlib";
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<LoadDefaultTheme themeColor="teal" />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
