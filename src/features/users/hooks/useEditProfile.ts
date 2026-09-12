import { useQueryClient, useMutation } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { useAbortController } from "~/hooks/useAbortController";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { getLoggedInUser, updateCurrentUser } from "~/features/users/usersApi";

export function useEditProfile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const updateUser = useServerFn(updateCurrentUser);
    const abortController = useAbortController()
    const { setFiles, upload, isUploading } = useUpload(["users"], abortController)

    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const mutation = useMutation(() => ({
        mutationFn: updateUser,
        onSuccess: () => {
            addToast({ text: "Success", type: "info" })
            queryClient.setQueryData(["users", user.id], user)
            queryClient.setQueryData(["you"], user)
        },
        onError(error) {
            addToast({ text: error.message, type: "error" })
        },
    }))

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

            await mutation.mutateAsync({ data: user, signal: abortController.signal },)
        }
        catch (error) {
            console.error(error)
            addToast({ text: "Something went wrong. Please try again later", type: "error" })
        }
    }
    return {
        handleSubmit,
        mutation,
        setUser,
        user,
        setFiles,
        isUploading
    }
}