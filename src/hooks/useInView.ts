import { Accessor, createEffect, createSignal } from "solid-js"

export function useInView(ref: Accessor<HTMLDivElement | undefined>) {
    const [isInView, setIsInView] = createSignal(false)
    const observer = new IntersectionObserver(entries => {
        if (entries.at(0)?.isIntersecting)
            setIsInView(true)
        else
            setIsInView(false)
    })
    createEffect(() => {
        const elem = ref();
        if (elem)
            observer.observe(elem)
    })
    return isInView
}