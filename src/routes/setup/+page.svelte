<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button, Center, Input } from "jxlib";
	import Halfs from "../Halfs.svelte";
	import VerticalPage from "../VerticalPage.svelte";
	import type { PageServerData, ActionData } from "./$types";

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Einrichtung - Abiwood27</title>
</svelte:head>

<VerticalPage>
	<Halfs firstSize={1} secondSize={4}>
		{#snippet first()}
			<Center fw fh>
				<h1>Einrichtung</h1>
			</Center>
		{/snippet}
		{#snippet second()}
			<Center fw>
				<form method="post" action="?/register" use:enhance>
					<p>
						Hallo! Abiwood27 scheint noch nicht eingerichtet
						zu sein.
						<br />
						<br />
						Gib dazu hier deine E-Mail-Adresse ein.
						<br />
						Du erhältst dann eine E-Mail mit einem Link, um dich als
						Administrator zu registrieren.
						<br />
						Du kannst dich danach immer wieder mit dieser E-Mail-Adresse
						anmelden, um die Seite zu verwalten.
					</p>
					<Input
						name="email"
						type="email"
						placeholder="E-Mail"
						required
						fw
					/>
					<Button submit fw>Los gehts!</Button>
					<p style="color: red">{form?.message ?? ""}</p>
				</form>
			</Center>
		{/snippet}
	</Halfs>
</VerticalPage>

<style>
	form {
		display: contents;
	}
</style>
