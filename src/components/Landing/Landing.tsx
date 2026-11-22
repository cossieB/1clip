import { For } from "solid-js";
import styles from "./Landing.module.css";
import { httpHeader } from "@solidjs/web";
import { paths } from "~/router";
import { Title } from "@solidjs/meta";

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


export default function Landing() {
    httpHeader("Cache-Control", "public, max-age=31536000")
    return (
        <main class={styles.landing}>
            <Title>1Clip</Title>
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
                    <a class="button secondary" href="/?dialog=signup">Join the Community</a>
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