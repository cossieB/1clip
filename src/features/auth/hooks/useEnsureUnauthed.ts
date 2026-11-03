import { createEffect, useContext } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { paths } from "~/router";
import { session } from "../authApi";

export function ensureUnauthed() {
    const [_, setSearch] = useSearchParams(paths)
    createEffect(
        () => session().data,
        data => {
            if (data) return setSearch({dialog: undefined}, {replace: true})
        }
    )
}