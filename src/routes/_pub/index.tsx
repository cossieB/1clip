import { createFileRoute, Link, redirect } from '@tanstack/solid-router'
import { getCurrentUser } from '~/serverFn/auth'
import styles from "./home.module.css"

export const Route = createFileRoute('/_pub/')({
    beforeLoad: async (ctx) => {
        const user = await getCurrentUser()
        if (user)
            throw redirect({ to: "/posts" })
    },
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div class={styles.home}>
            <div class={styles.hero}>
                <h1>1Clip</h1>
                <div class={styles.more}>
                    <h2>Level Up Your Legacy</h2>
                    <p>
                        Stop letting your greatest gaming moments gather digital dust. Whether you just pulled off a 1-in-a-million trickshot, penned a soul-crushing alternate ending for your favorite RPG, or spent forty hours perfecting a digital portrait, <span>1Clip</span> is where it belongs. <br />
                        <Link class={styles.call} to='/posts'>Browse</Link>
                        <Link class={styles.call} to='/auth/signup'>Join the Community</Link>
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