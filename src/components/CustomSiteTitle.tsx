import { Title } from "@solidjs/meta";
import { ParentProps } from "solid-js";

export function SiteTitle(props: ParentProps) {
    return <Title> {props.children} :: 1Clip </Title>
}