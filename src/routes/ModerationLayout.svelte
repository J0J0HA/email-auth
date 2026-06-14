<script lang="ts">
    import { page } from "$app/state";
    import type { Action } from "svelte/action";
    import { FIcon } from "jxlib";
    import type { Snippet } from "svelte";

    let {
        children,
        user,
    }: {
        children: Snippet;
        user: {
            id: string;
            email: string;
            displayName: string;
            isAdmin: boolean;
            isDev: boolean;
        };
    } = $props();

    const hightlightIfOpen: Action = (node) => {
        if (!(node instanceof HTMLAnchorElement)) return;
        const target = new URL(node.href);

        console.log("Setup for", target);

        $effect(() => {
            console.log(target, page.url.pathname === target.pathname);
            if (page.url.pathname === target.pathname) {
                node.classList.add("open");
            } else {
                node.classList.remove("open");
            }
        });
    };
</script>

<div class="wrapper">
    <nav>
        <h2>Developer</h2>
        <ul>
            <li>
                <a href="/developers/applications" use:hightlightIfOpen>
                    <FIcon icon="code" />
                    Applikationen
                </a>
            </li>
        </ul>
        {#if user.isAdmin}
            <h2>Administration</h2>
            <ul>
                <li>
                    <a href="/admin/users" use:hightlightIfOpen>
                        <FIcon icon="users" />
                        Nutzer
                    </a>
                </li>
                <li>
                    <a href="/developers/applications" use:hightlightIfOpen>
                        <FIcon icon="code" />
                        Applikationen
                    </a>
                </li>
            </ul>
        {/if}
    </nav>
    <section>
        {@render children?.()}
    </section>
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: stretch;
        align-items: stretch;
        height: 100%;
        width: 100%;
    }

    nav {
        width: 200px;
        border-right: 1px solid lightgray;
        padding-top: 1.5rem;
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin-inline: 1rem;
    }

    nav a {
        border-radius: 4px;
        margin-bottom: 0.25rem;

        text-decoration: none;
        color: inherit;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        padding-block: 0.62rem;
        padding-inline: 0.9rem;
        padding-right: 3rem;
    }

    nav a:hover {
        background-color: color-mix(in srgb, lightgray, transparent 60%);
    }

    nav a:global(.open) {
        background-color: color-mix(in srgb, lightgray, transparent 80%);
    }

    nav h2 {
        margin-top: -0.5rem;
        margin-bottom: -0.75rem;
        margin-inline: 1.5rem;
        padding: 0;
        font-size: 0.78rem;
    }

    section {
        display: contents;
    }
</style>
