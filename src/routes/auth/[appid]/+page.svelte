<script lang="ts">
	import { enhance } from "$app/forms";
	import { Button, Center, Column, Input, Row } from "jxlib";
	import Halfs from "../../Halfs.svelte";
	import VerticalPage from "../../VerticalPage.svelte";
	import type { ActionData } from "./$types";
	import type { PageServerData } from "./$types";

	let { form, data }: { form: ActionData; data: PageServerData } = $props();
</script>

<svelte:head>
	<title>Anmelden bei {data.app?.displayName} - Abiwood27</title>
</svelte:head>

<VerticalPage>
	<Halfs firstSize={1} secondSize={4}>
		{#snippet first()}
			<Center fw fh>
				<h1>
					Anmelden bei {data.app?.displayName}
				</h1>
			</Center>
		{/snippet}
		{#snippet second()}
			<form method="post" action="?/continue" use:enhance>
				<Column fw fh>
					Die haben dann deine Daten.
					<Button fw submit>Anmelden</Button>
					<p style:color="red">{form?.message ?? ""}</p>
				</Column>
			</form>
		{/snippet}
	</Halfs>
</VerticalPage>

<!-- <Center fw fh>
	<Card ---w="min(500px, max(100px, 80dvw))">
		<center>
			<h1>Login/Register</h1>
		</center>
		<form method="post" action="?/login" use:enhance>
			<Row fw fh>
				<Column fw fh>
					<Input name="username" placeholder="Name" fw>Name</Input>
					<Input
						name="password"
						placeholder="Passwort"
						type="password"
						fw
					>
						Passwort
					</Input>
					<div class="br"></div>
					<Button fw submit>Anmelden</Button>
					<Button fw secondary submit formaction="?/register">
						Registrieren
					</Button>
					<p style="color: red">{form?.message ?? ""}</p>
				</Column>
			</Row>
		</form>
	</Card>
</Center> -->
