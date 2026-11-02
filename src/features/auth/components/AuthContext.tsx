import { Accessor, createContext, createMemo, ParentProps, SourceAccessor } from "solid-js";
import { useStore } from "../useSession";
import { authClient } from "../authClient";
import { Atom } from "better-auth/client";

type Auth<T> = T extends Atom<infer U> ? U : never

export const AuthContext = createContext<SourceAccessor<Auth<typeof authClient["useSession"]>>>()

export function AuthProvider(props: ParentProps) {
    const session = createMemo(() => useStore(authClient.useSession)(), {ssrSource: "client"})
    return (
        <AuthContext value={session}>
            {props.children}
        </AuthContext>
    )
}