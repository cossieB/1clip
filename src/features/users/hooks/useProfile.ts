import z from "zod";
import { UpdateUserSchema } from "../utils/zod";
import { action, affects, createMemo, createOptimistic, createStore, refresh, useContext } from "solid-js";
import { getProfileFn, updateUserFn } from "../userApi";
import { useUpload } from "~/hooks/useUpload";
import { useAbortController } from "~/hooks/useAbortController";
import { getUsersSignedUrls } from "~/integrations/storageService/serverFn";
import { useToastError } from "~/hooks/useToastError";
import { revalidate } from "@solidjs/router";

export function useProfile() {
    const abortController = useAbortController()
    const toastError = useToastError()
    const { setFiles, convertAndUpload } = useUpload(abortController)
    const user = createMemo(() => getProfileFn())
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
        try {
            affects(user)
            setIsSubmitting(true)
            const uploadResult = await convertAndUpload(getUsersSignedUrls);
            const newAvatar = uploadResult.find(x => x.field === "avatar")
            const newBanner = uploadResult.find(x => x.field === "banner")
            setInput(s => {
                if (newAvatar) s.image = newAvatar.key
                if (newBanner) s.banner = newBanner.key
            })
            yield updateUserFn(input)
            
        }
        catch (error) {
            console.error(error)
            toastError(error)
        }
    })

    return { user, updateUserAction, isSubmitting, input, setInput, setFiles }
}