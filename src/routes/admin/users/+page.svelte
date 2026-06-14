<script lang="ts">
    import { Button, FIcon, Input, Row, Spacer } from "jxlib";
    import type { ActionData, PageServerData } from "./$types";
    import { goto } from "$app/navigation";
    import {
        deleteUser,
        getLoginCodeForUser,
        getUsers,
        loginAsUser,
    } from "$lib/remote/users.remote";
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
    let editingUserId = $state<string | null>(null);
    let editingDisplayName = $state("");
    let editingEmail = $state("");
    let editingisDev = $state(false);
    let editingIsAdmin = $state(false);

    let hightlightUserId = $derived(
        page.url.searchParams.get("userId") || null,
    );
</script>

<div class="inset">
    <h1>
        Nutzer
    </h1>
    <br />

    <Row fw justify="end">
        <Button icon="refresh-cw" onclick={() => getUsers().refresh()}>
            Aktualisieren
        </Button>
        <Button
            icon="plus"
            onclick={() => {
                showCreateForm = true;
                editingUserId = null;
                editingDisplayName = "";
                editingEmail = "";
                editingisDev = false;
                editingIsAdmin = false;
            }}
        >
            Nutzer erstellen
        </Button>
    </Row>

    <Spacer h="1rem" />

    {#if showCreateForm}
        <form
            method="post"
            action={editingUserId === null ? "?/createUser" : `?/updateUser`}
            use:enhance={() => {
                loading = true;

                return async ({ update }) => {
                    await update();
                    console.log(form);
                    if (form?.success) {
                        await getUsers().refresh();
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
            {#if editingUserId !== null}
                <input
                    type="hidden"
                    name="userId"
                    value={editingUserId || ""}
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
                name="email"
                placeholder="Email-Addresse"
                bind:value={editingEmail}
            >
                Email-Addresse
            </Input>
            <br />
            <label>
                <input
                    type="checkbox"
                    name="isDev"
                    id="isDev"
                    bind:checked={editingisDev}
                    onchange={() => {
                        if (editingIsAdmin) editingisDev = true;
                    }}
                /> Developer
            </label>
            <br />
            <label>
                <input
                    type="checkbox"
                    name="isAdmin"
                    id="isAdmin"
                    bind:checked={editingIsAdmin}
                    onchange={() => {
                        if (editingIsAdmin) editingisDev = true;
                        if (
                            editingUserId === data.user?.id &&
                            !editingIsAdmin
                        ) {
                            editingIsAdmin = true;
                            alert(
                                "Du kannst deine eigenen Admin-Rechte nicht entfernen. Bitte einen anderen Administrator, deine Rechte zu entfernen, falls du das möchtest.",
                            );
                        }
                    }}
                /> Admin
            </label>
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
                        {editingUserId === null
                            ? "Nutzer erstellen"
                            : "Nutzer aktualisieren"}
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
                <th>Anzeigename</th>
                <th>Email</th>
                <th>Rechte</th>
                <th>Aktionen</th>
            </tr>
        </thead>
        <tbody>
            {#each await getUsers() as user}
                <tr class:highlighted={user.id === hightlightUserId}>
                    <td>{user.displayName}</td>
                    <td>{user.email}</td>
                    <td
                        >{user.isAdmin
                            ? "Admin"
                            : user.isDev
                              ? "Developer"
                              : "User"}</td
                    >
                    <td>
                        <Row>
                            <Button
                                icon="log-in"
                                disabled={user.id === data.user?.id}
                                onclick={async () => {
                                    if (
                                        confirm(
                                            "Möchtest du dich in diesem Fenster als " +
                                                user.displayName +
                                                " anmelden? Dadurch wirst du von deinem aktuellen Account abgemeldet.",
                                        )
                                    ) {
                                        await loginAsUser({
                                            userId: user.id,
                                        });
                                        goto("/account");
                                    } else {
                                        const loginToken =
                                            await getLoginCodeForUser({
                                                userId: user.id,
                                            });
                                        if (loginToken.success) {
                                            prompt(
                                                "Du kannst den folgenden Code auf einem beliebeigen Gerät auf der Anmeldeseite eingeben, um dich als " +
                                                    user.displayName +
                                                    " anzumelden:",
                                                loginToken.code,
                                            );
                                        } else {
                                            alert(
                                                "Fehler beim Abrufen des Login-Codes: " +
                                                    loginToken.message,
                                            );
                                        }
                                    }
                                }}
                            />
                            <Button
                                icon="edit"
                                onclick={() => {
                                    editingUserId = user.id;
                                    showCreateForm = true;
                                    editingDisplayName = user.displayName;
                                    editingEmail = user.email;
                                    editingisDev = user.isDev || user.isAdmin;
                                    editingIsAdmin = user.isAdmin;
                                }}
                            />
                            <Button
                                icon="trash"
                                onclick={async () => {
                                    if (
                                        !confirm(
                                            `Möchtest du den Nutzer ${user.displayName} wirklich löschen?`,
                                        )
                                    )
                                        return;
                                    response = await deleteUser({
                                        userId: user.id,
                                    });
                                    await getUsers().refresh();
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
