import styles from "./PhotoCardLink.module.css"
import type { Require } from "~/lib/utilityTypes"
import { For, Loading } from "solid-js"
import { mediaSrc } from "~/utils/mediaSrc"

type Props = {
    label: string
    picture: string
    sublabel?: string
    href: string
    attr?: {
        [x: string]: string;
    }

}

export function PhotoCardLink(props: Props) {

    return (
        <div {...props.attr} class={styles.card} >
            <div class={`${styles.imgWrapper}`}>
                <img
                    // style={{ "view-transition-name": key + value }}
                    src={mediaSrc(props.picture)}
                    loading="lazy"
                    alt=""
                />
            </div>
            <label class="cutout">
                {props.label}
                <span>{props.sublabel}</span>
            </label>
            <a class={styles.a} href={props.href} />
        </div>
    )
}

type P<T> = {
    arr: T[]
    getLabel: (item: T) => string
    getPic: (item: T) => string
    getSublabel?: (item: T) => string
    getHref: (item: T) => string
    getAttr?: (item: T) => {
        [x: string]: string;
    }

}

export function PhotoCardGrid<T>(props: P<T>) {
    return (
        <Loading fallback={<PhotoCardGridSkeleton />}>
            <div class={styles.grid} >
                <For each={props.arr}>
                    {item =>
                        <PhotoCardLink
                            label={props.getLabel(item)}
                            picture={props.getPic(item)}
                            href={props.getHref(item)}
                            sublabel={props.getSublabel?.(item)}
                            attr={props.getAttr?.(item)}
                        />
                    }
                </For>
            </div>
        </Loading>
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