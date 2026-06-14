<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button, Center, Column, Input, Row, Spacer } from "jxlib";
	import Halfs from "../../Halfs.svelte";
	import VerticalPage from "../../VerticalPage.svelte";
	import type { ActionData } from "./$types";
	import type { PageServerData } from "./$types";

	let { form, data }: { form: ActionData; data: PageServerData } = $props();
	$inspect(data);
</script>

<svelte:head>
	<title>Anmelden bei {data.app?.displayName} - Abiwood27</title>
</svelte:head>

<VerticalPage>
	<Halfs firstSize={1} secondSize={4}>
		{#snippet first()}
			<Center fw fh>
				<h1>
					Weiter zu {data.app?.displayName}
				</h1>
			</Center>
		{/snippet}
		{#snippet second()}
			<form method="post" action="?/continue" use:enhance>
				<Column fw fh>
					<p style:text-align="center">
						Das ist eine App von {data.app?.owner?.displayName}.
						<br />
						Kontakt zum Entwickler: {data.app?.owner?.email}
					</p>
					<Spacer h="3em" />
					<Button fw submit>Anmelden</Button>
					<p style:color="red">{form?.message ?? ""}</p>
				</Column>
			</form>
		{/snippet}
	</Halfs>
</VerticalPage>

<style>
	form {
		display: contents;
	}
</style>
