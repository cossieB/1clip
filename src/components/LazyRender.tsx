import { createSignal, onSettled, ParentProps, Show, type Element } from "solid-js";

type LazyRenderProps = {
    rootMargin?: string;
    fallback?: Element;
};

export function LazyRender(props: ParentProps<LazyRenderProps>) {
    let element!: HTMLDivElement;
    const [shouldRender, setShouldRender] = createSignal(false);

    onSettled(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldRender(true);
                observer.disconnect();
            }
        }, {
            rootMargin: props.rootMargin,
        })

        observer.observe(element);
        return () => observer.disconnect();
    });

    return (
        <div ref={element}>
            <Show when={shouldRender()} fallback={props.fallback}>
                {props.children}
            </Show>
        </div>
    );
}
