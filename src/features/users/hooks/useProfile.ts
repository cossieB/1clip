import z from "zod";
import { UpdateUserSchema } from "../utils/zod";
import { action, affects, createMemo, createOptimistic, createStore, refresh } from "solid-js";
import { getProfile, updateUser } from "../userApi";

export function useProfile() {
    const user = createMemo(() => getProfile())
    const [isSubmitting, setIsSubmitting] = createOptimistic(false)

    const [input, setInput] = createStore(() => user() as unknown as z.infer<typeof UpdateUserSchema>, {
        displayName: "",
        bio: "",
        location: "",
        dob: "",
        links: [],
        image: "",
        banner: ""
    })

    const updateUserAction = action(async function* () {
        setIsSubmitting(true)
        affects(user)
        yield updateUser(input)
        refresh(user)
    })

    return { user, updateUserAction, isSubmitting, input, setInput }
}