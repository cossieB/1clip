import { action, useAction, useSubmission } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { createStore } from "solid-js/store";
import { useAbortController } from "~/hooks/useAbortController";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { getLoggedInUser, updateCurrentUser } from "~/services/userService";

const a = action(updateCurrentUser)

export function useEditProfile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const actionFn = useAction(a)
    const submission = useSubmission(a)
    const abortController = useAbortController()
    const { setFiles, upload, isUploading } = useUpload(["users"], abortController)
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const isPending = () => submission.pending || isUploading()
    const [user, setUser] = createStore({ ...props.user })

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        try {
            const uploadResult = await upload();
            const newAvatar = uploadResult.find(x => x.field === "avatar")
            const newBanner = uploadResult.find(x => x.field === "banner")
            setUser({
                ...newAvatar && { image: newAvatar.key },
                ...newBanner && { banner: newBanner.key }
            })
            await actionFn(user);
            addToast({ text: "Success", type: "info" })
            queryClient.setQueryData(["users", user.id], user)
            queryClient.setQueryData(["you"], user)
        }
        catch (error: any) {
            addToast({ text: error.message ?? "Something went wrong. Please try again later", type: "error" })
        }
    }
    return {
        handleSubmit,
        setUser,
        user,
        setFiles,
        isPending
    }
}