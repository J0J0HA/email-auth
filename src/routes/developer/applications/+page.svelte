<script lang="ts">
    import { Button, FIcon, Input, Row, Spacer } from "jxlib";
    import type { ActionData, PageServerData } from "./$types";
    import { goto } from "$app/navigation";
    import {
        deleteApplication,
        getMyApplications,
    } from "$lib/remote/applications.remote";
    import { enhance } from "$app/forms";
    import { page } from "$app/state";

    let { data, form }: { data: PageServerData; form: ActionData } = $props();

    let response: {
        success: boolean;
        message: string;
    } = $state({
        success: false,
        message: "",
    });

    let loading = $state(false);
    let recentlyUpdated = $state(false);

    let showCreateForm = $state(false);
    let editingAppId = $state<string | null>(null);
    let editingDisplayName = $state("");
    let editingRedirectTo = $state("");
</script>

<div class="inset">
    <h1>
        Applikationen
    </h1>
    <br />

    <Row fw justify="end">
        <Button icon="refresh-cw" onclick={() => getMyApplications().refresh()}>
            Aktualisieren
        </Button>
        <Button
            icon="plus"
            onclick={() => {
                showCreateForm = true;
                editingAppId = null;
                editingDisplayName = "";
                editingRedirectTo = "";
            }}
        >
            App erstellen
        </Button>
    </Row>

    <Spacer h="1rem" />

    {#if showCreateForm}
        <form
            method="post"
            action={editingAppId === null ? "?/createApplication" : `?/updateApplication`}
            use:enhance={() => {
                loading = true;

                return async ({ update }) => {
                    await update();
                    console.log(form);
                    if (form?.success) {
                        await getMyApplications().refresh();
                        showCreateForm = false;
                    }
                    response = {
                        success: form?.success ?? false,
                        message: form?.message ?? "An error occurred",
                    };
                    loading = false;
                    recentlyUpdated = true;
                    setTimeout(() => (recentlyUpdated = false), 1000);
                };
            }}
        >
            {#if editingAppId !== null}
                <input
                    type="hidden"
                    name="appId"
                    value={editingAppId || ""}
                />
            {/if}
            <Input
                name="displayName"
                placeholder="Anzeigename"
                bind:value={editingDisplayName}
            >
                Anzeigename
            </Input>
            <br />
            <Input
                name="redirectTo"
                placeholder="Redirect URI"
                bind:value={editingRedirectTo}
            >
                Redirect URI
            </Input>
            <br />
            <br />
            <Row>
                <Button submit disabled={loading || recentlyUpdated}>
                    <Row>
                        {#if loading}
                            <FIcon icon="loader" rotating />
                        {:else if recentlyUpdated}
                            <FIcon icon="x" />
                        {/if}
                        {editingAppId === null
                            ? "App erstellen"
                            : "App aktualisieren"}
                    </Row>
                </Button>
                <Button secondary onclick={() => (showCreateForm = false)}>
                    Abbrechen
                </Button>
            </Row>
        </form>
        <br />
    {/if}

    <p style:color={response.success ? "green" : "red"}>
        {response.message}
    </p>

    <Spacer h="1rem" />

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Anzeigename</th>
                <th>Redirect URI</th>
                <th>Aktionen</th>
            </tr>
        </thead>
        <tbody>
            {#each await getMyApplications() as app}
                <tr>
                    <td><code>{app.id}</code></td>
                    <td>{app.displayName}</td>
                    <td><code>{app.redirectTo}</code></td>
                    <td>
                        <Row>
                            <Button
                                icon="edit"
                                onclick={() => {
                                    editingAppId = app.id;
                                    showCreateForm = true;
                                    editingDisplayName = app.displayName;
                                    editingRedirectTo = app.redirectTo;
                                }}
                            />
                            <Button
                                icon="trash"
                                onclick={async () => {
                                    if (
                                        !confirm(
                                            `Möchtest du die App ${app.displayName} wirklich löschen?`,
                                        )
                                    )
                                        return;
                                    response = await deleteApplication({
                                        appId: app.id,
                                    });
                                    await getMyApplications().refresh();
                                }}
                            />
                        </Row>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .inset {
        padding: 4rem;
        border-radius: 8px;

        height: 100%;
        width: 100%;
    }

    table {
        width: 100%;
        border-collapse: collapse;

        th,
        td {
            text-align: left;
            padding: 0.5rem;
            border-bottom: 1px solid lightgray;
            border-right: 1px solid lightgray;
        }

        th:last-child,
        td:last-child {
            border-right: none;
        }

        tr.highlighted {
            background-color: color-mix(in srgb, yellow 20%, transparent);
        }
    }
</style>
