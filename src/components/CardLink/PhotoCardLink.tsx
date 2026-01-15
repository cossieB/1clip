import { Link, type LinkComponentProps } from "@tanstack/solid-router"
import styles from "./PhotoCardLink.module.css"
import type { Require } from "~/lib/utilityTypes"
import { For, Suspense } from "solid-js"

type Props = {
    label: string
    picture: string
    sublabel?: string
} & Require<LinkComponentProps, 'to' | 'params'>

export function PhotoCardLink(props: Props) {
    const key = Object.keys(props.params)[0];
    // @ts-expect-error
    const value = props.params[key];
    return (
        <div role="img" class={styles.card}>
            <div class={`${styles.imgWrapper} cutout`}>
                <img
                    style={{ "view-transition-name": key + value }}
                    src={props.picture}
                    loading="lazy"
                    alt=""
                />
            </div>
            <label class="cutout">
                {props.label}
                <span>{props.sublabel}</span>
            </label>
            <Link viewTransition class={styles.a} to={props.to} params={props.params} />
        </div>
    )
}

type P<T> = {
    arr: T[]
    getLabel: (item: T) => string
    getPic: (item: T) => string
    getParam: (item: T) => NonNullable<LinkComponentProps['params']>
    getSublabel?: (item: T) => string
} & Require<LinkComponentProps, 'to'>

export function PhotoCardGrid<T>(props: P<T>) {
    return (
        <Suspense fallback={<PhotoCardGridSkeleton />}>
            <div class={styles.grid} >
                <For each={props.arr}>
                    {item =>
                        <PhotoCardLink
                            label={props.getLabel(item)}
                            picture={props.getPic(item)}
                            to={props.to}
                            params={props.getParam(item)}
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
            <For each={new Array(50).fill(null)}>
                {_ =>
                    <div class={styles.card} style={{ "pointer-events": "none" }}>
                        <div class="pulse" style={{ height: "15rem" }} />
                    </div>
                }
            </For>
        </div>
    )
}