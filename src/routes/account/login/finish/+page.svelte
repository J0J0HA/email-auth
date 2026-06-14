<script lang="ts">
    import { enhance } from "$app/forms";
    import { Button, Center, Column, Input, Row, Spacer } from "jxlib";
    import Halfs from "../../../Halfs.svelte";
    import VerticalPage from "../../../VerticalPage.svelte";
    import type { ActionData } from "./$types";
    import { browser } from "$app/environment";

    let { form }: { form: ActionData } = $props();

    let token: string = $state("");

    if (browser) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get("code") ?? "";
    }
</script>

<svelte:head>
    <title>Anmelden - Abiwood27</title>
</svelte:head>

<VerticalPage>
    <Halfs firstSize={1} secondSize={4}>
        {#snippet first()}
            <Center fw fh>
                <h1>Anmelden</h1>
            </Center>
        {/snippet}
        {#snippet second()}
            <form method="post" action="?/loginWithToken" use:enhance>
                <Row fw fh>
                    <Column fw fh>
                        <p style:text-align="center">
                            Ein Login-Code wurde an deine E-Mail-Adresse gesendet.
            Bitte gib ihn hier ein, um dich anzumelden.
            <br /><br />
            Wenn du deine E-Mails auf diesem Gerät abrufst,
            kannst du stattdessen auch einfach auf den Link in der E-Mail klicken, 
            um dich anzumelden.
                        </p>
                        <Spacer h="1rem" />
                        <Input
                            name="token"
                            type="text"
                            placeholder="Login-Code"
                            fw
                            value={token}
                        >
                            Login-Code
                        </Input>
                        <div class="br"></div>
                        <Button fw submit>Anmelden</Button>
                        <p style:color="red">{form?.message ?? ""}</p>
                        <p style:text-align="center">
                            Wenn du keinen Login-Code erhälst, wende dich an einen Administrator.
                        </p>
                    </Column>
                </Row>
            </form>
        {/snippet}
    </Halfs>
</VerticalPage>
