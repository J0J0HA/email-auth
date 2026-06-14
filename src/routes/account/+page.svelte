<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button, Center, Column, FIcon, Input, Row } from "jxlib";
	import Halfs from "../Halfs.svelte";
	import VerticalPage from "../VerticalPage.svelte";
	import type { ActionData, PageServerData } from "./$types";
	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	let loading = $state(false);
	let recentlyUpdated = $state(false);
</script>

<svelte:head>
	<title>Profil - Abiwood27</title>
</svelte:head>

<VerticalPage>
	<Halfs firstSize={1} secondSize={4}>
		{#snippet first()}
			<Center fw fh>
				<h1>
					Profil
				</h1>
			</Center>
		{/snippet}
		{#snippet second()}
			<Column fw fh justify="start">
				<form
					method="post"
					action="?/updateAccount"
					use:enhance={() => {
						loading = true;

						return async ({ update }) => {
							await update();
							loading = false;
							recentlyUpdated = true;
							setTimeout(() => (recentlyUpdated = false), 1000);
						};
					}}
				>
					<Input
						name="displayName"
						type="text"
						placeholder="Anzeigename"
						fw
						value={data.user.displayName}
					>
						Anzeigename
					</Input>
					<Input
						name="email"
						type="email"
						placeholder="E-Mail-Adresse"
						fw
						value={data.user.email}
						disabled
					>
						E-Mail-Adresse
					</Input>
					<div class="br"></div>
					<Button fw submit disabled={loading || recentlyUpdated}>
						<Row align="center">
							{#if loading}
								<FIcon icon="loader" rotating />
								Wird gespeichert...
							{:else if recentlyUpdated}
								<FIcon icon="check" />
								Gespeichert
							{:else}
							Speichern
							{/if}
						</Row>
					</Button>
				</form>
				<form method="post" action="?/logout" use:enhance>
					<Button fw secondary submit>
						Abmelden
					</Button>
				</form>
				<p>
					UID: {data.user.id}
					<br>
					<br>
					<br>
					Zugang zur Entwicklerschnittstelle per E-Mail Anfragen: johannes@jojojux.de
				</p>
				<p style="color: red">{form?.message ?? ""}</p>
			</Column>
		{/snippet}
	</Halfs>
</VerticalPage>

<style>
	form {
		display: contents;
	}
</style>
