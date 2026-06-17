import styles from "./PhotoCardLink.module.css"
import type { Require } from "~/lib/utilityTypes"
import { ComponentProps, For, Suspense } from "solid-js"
import { A } from "@solidjs/router"

type Props = {
    label: string
    picture: string
    sublabel?: string
} & ComponentProps<typeof A>

export function PhotoCardLink(props: Props) {

    return (
        <div data-type="card" class={styles.card} >
            <div class={`${styles.imgWrapper} cutout`}>
                <img
                    // style={{ "view-transition-name": key + value }}
                    src={props.picture}
                    loading="lazy"
                    alt=""
                />
            </div>
            <label class="cutout">
                {props.label}
                <span>{props.sublabel}</span>
            </label>
            <A class={styles.a} href={props.href}  />
        </div>
    )
}

type P<T> = {
    arr: T[]
    getLabel: (item: T) => string
    getPic: (item: T) => string
    getSublabel?: (item: T) => string
    getHref: (item: T) => string
} 

export function PhotoCardGrid<T>(props: P<T>) {
    return (
        <Suspense fallback={<PhotoCardGridSkeleton />}>
            <div class={styles.grid} >
                <For each={props.arr}>
                    {item =>
                        <PhotoCardLink
                            label={props.getLabel(item)}
                            picture={props.getPic(item)}
                            href={props.getHref(item) }                            
                            sublabel={props.getSublabel?.(item)}
                        />
                    }
                </For>
            </div>
        </Suspense>
    )
}

export function PhotoCardGridSkeleton() {
    return (
        <div class={styles.grid}>
            <For each={Array.from({length: 50})}>
                {_ =>
                    <div class={styles.card} style={{ "pointer-events": "none" }}>
                        <div class="pulse" style={{ height: "15rem" }} />
                    </div>
                }
            </For>
        </div>
    )
}