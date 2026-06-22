import { A, createAsync, query, redirect, RouteDefinition } from "@solidjs/router"
import styles from "./home.module.css"
import { getCookie, setCookie } from "@solidjs/start/http"
import { getRequestEvent } from "solid-js/web"



const loader = query(async () => {
    'use server'
    const visited = getCookie("visited")
    if (visited) throw redirect("/posts")
    setCookie("visited", "1", {
        path: "/",            
    })
    const user = getRequestEvent()?.locals.user
    if (user) throw redirect("/posts")

}, "firstLoad")

export default function LandingRoute() {
    createAsync(() => loader(), {
        deferStream: true
    })
    return (
        <div class={styles.home}>
            <div class={styles.hero}>
                <h1>1Clip</h1>
                <div class={styles.more}>
                    <h2>Level Up Your Legacy</h2>
                    <p>
                        Show off your best gaming moments, epic screenshots, hilarious clips, jaw-dropping fanart, and immersive fanfic — all in one place. Whether you're here to flex your skills, share your stories, or just vibe with fellow gamers, this is your arena. Upload, explore, and connect with a community that celebrates every pixel and every word. <br />
                        <A class={styles.call} href='/posts'>Browse</A>
                        <A class={styles.call} href='/auth/signup'>Join the Community</A>
                    </p>
                </div>
            </div>
            <h3>Show Off. Speak Up. Stay Inspired.</h3>
            <div class={styles.columns}>
                <div><header>The Clip Vault</header> Upload high-res gameplay and let the world see that "accidental" pentakill.</div>
                <div><header>The Gallery</header> From stunning screenshots to professional-grade fanart, put your vision on the main stage.</div>
                <div><header>The Archive</header> Post your fanfic and lore theories for a community that actually breathes the story.</div>
                <div><header>The Squad</header> Connect with creators who geek out over the same mechanics and mythos as you.</div>
            </div>
            <aside>"Your gameplay is a story. Your art is a tribute. Your community is waiting."</aside>
        </div>
    )
}