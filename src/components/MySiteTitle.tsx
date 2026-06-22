import { Title } from "@solidjs/meta";
import { JSXElement } from "solid-js";

export function MySiteTitle(props: {children: JSXElement}) {
    return <Title> {props.children} :: 1Clip </Title>
}