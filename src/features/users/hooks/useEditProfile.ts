import { useQueryClient, useMutation } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { createStore } from "solid-js/store";
import { useAbortController } from "~/hooks/useAbortController";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { objectDifference } from "~/lib/objectDifference";
import { getLoggedInUser, updateCurrentUser } from "~/serverFn/users";
import { getProfileSignedUrl } from "~/services/uploadService";

export function useEditProfile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const updateUser = useServerFn(updateCurrentUser);
    const abortController = useAbortController()
    const { getSignedUrl, state: uploadState, setFiles, upload } = useUpload(getProfileSignedUrl, abortController)

    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const mutation = useMutation(() => ({
        mutationFn: updateUser,
        onSuccess: () => {
            addToast({ text: "Success", type: "info" })
            queryClient.setQueryData(["users", user.userId], user)
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
            await upload();
            const newAvatar = uploadState.images.at(0)
            const newBanner = uploadState.images.at(1)
            setUser({
                ...newAvatar && { image: newAvatar.key },
                ...newBanner && { banner: newBanner.key }
            })
            const obj = objectDifference(user, props.user)

            if (Object.keys(obj).length === 0) return addToast({ text: "Nothing to update", type: "warning" })
            await mutation.mutateAsync({ data: obj, signal: abortController.signal },)
        }
        catch (error) {
            addToast({ text: "Something went wrong. Please try again later", type: "error" })
        }
    }
    return {
        handleSubmit,
        mutation,
        setUser,
        user,
        getSignedUrl,
        uploadState,
        setFiles
    }
}