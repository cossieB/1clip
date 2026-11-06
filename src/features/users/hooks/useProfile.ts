import z from "zod";
import { UpdateUserSchema } from "../utils/zod";
import { action, affects, createMemo, createOptimistic, createStore, refresh, useContext } from "solid-js";
import { getProfile, updateUser } from "../userApi";
import { useUpload } from "~/hooks/useUpload";
import { useAbortController } from "~/hooks/useAbortController";
import { ToastContext } from "~/components/Toast/ToastProvider";
import { getUsersSignedUrls } from "~/integrations/storageService/serverFn";

export function useProfile() {
    const abortController = useAbortController()
    const { addToast } = useContext(ToastContext)
    const { setFiles, upload, isUploading, getSignedUrls, convertAndUpload } = useUpload(abortController)
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
            yield updateUser(input)
            refresh(user)
        }
        catch (error) {
            console.error(error)
            addToast({ text: "Something went wrong. Please try again later", type: "error" })
        }
    })

    return { user, updateUserAction, isSubmitting, input, setInput, setFiles }
}