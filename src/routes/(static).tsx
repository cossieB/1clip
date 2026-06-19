import { JSXElement } from "solid-js";
import { HttpHeader } from "@solidjs/start";

export default function StaticLayout(props: {children: JSXElement}) {
    return (
        <>
            <HttpHeader name="cache-control" value="max-age=86400, public, immutable, stale-while-revalidate=604800" append={false}/>
            {props.children}
        </>
    )
}