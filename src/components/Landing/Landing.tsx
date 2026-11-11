import { createMemo, For } from "solid-js";
import styles from "./Landing.module.css";
import { query } from "@solidjs/router";
import { redirect, getRequestEvent } from "@solidjs/web";
import { createCookie, Cookie } from "@remix-run/cookie"
import { paths } from "~/router";
import { getCurrentUser } from "~/features/auth/serverFn";

const features = [
    {
        title: "The Clip Vault",
        text: "Upload high-res gameplay and let the world see that \u201Caccidental\u201D pentakill.",
    },
    {
        title: "The Gallery",
        text: "From stunning screenshots to professional-grade fanart, put your vision on the main stage.",
    },
    {
        title: "The Archive",
        text: "Post your fanfic and lore theories for a community that actually breathes the story.",
    },
    {
        title: "The Squad",
        text: "Connect with creators who geek out over the same mechanics and mythos as you.",
    },
];

const loader = query(async () => {
    'use server'
    const sessionCookie = createCookie("visited", {
        path: "/",
        maxAge: 31556926
    })
    const event = getRequestEvent()
    if (!event) return
    const cookieHeader = event.request.headers.get("Cookie")
    if (!cookieHeader) return;
    const visited = await sessionCookie.parse(cookieHeader)
    if (visited) throw redirect(paths.posts())
    event.response.headers.append("Set-Cookie", await  sessionCookie.serialize("1"))
    const user = await getCurrentUser()
    if (user) throw redirect(paths.posts())
}, "firstLoad")

export default function Landing() {
    createMemo(() => loader(), {
        deferStream: true
    })
    return (
        <main class={styles.landing}>
            <section class={styles.hero}>
                <span class={styles.brand}>1Clip</span>
                <h1 class={styles.title}>Level Up Your Legacy</h1>
                <p class={styles.lead}>
                    Show off your best gaming moments, epic screenshots, hilarious clips,
                    jaw-dropping fanart, and immersive fanfic — all in one place. Whether
                    you're here to flex your skills, share your stories, or just vibe with
                    fellow gamers, this is your arena. Upload, explore, and connect with a
                    community that celebrates every pixel and every word.
                </p>
                <div class={styles.actions}>
                    <a class="button primary" href={paths.posts()}>Browse</a>
                    <a class="button secondary" href="/auth/signup">Join the Community</a>
                </div>
            </section>

            <section class={styles.features} aria-labelledby="features-heading">
                <h2 id="features-heading">Show Off. Speak Up. Stay Inspired.</h2>
                <ul class={styles.grid}>
                    <For each={features}>
                        {(feature, i) => (
                            <li class="card">
                                <span class={styles.index}>{String(i() + 1).padStart(2, "0")}</span>
                                <h3 class={styles.cardTitle}>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </li>
                        )}
                    </For>
                </ul>
            </section>

            <blockquote class={styles.quote}>
                <p>
                    &ldquo;Your gameplay is a story. Your art is a tribute. Your community is
                    waiting.&rdquo;
                </p>
            </blockquote>
        </main>
    );
}