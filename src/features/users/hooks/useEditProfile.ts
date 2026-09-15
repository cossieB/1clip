import { useQueryClient, useMutation } from "@tanstack/solid-query";
import { useServerFn } from "@tanstack/solid-start";
import { createStore, produce } from "solid-js/store";
import { useAbortController } from "~/hooks/useAbortController";
import { useToastContext } from "~/hooks/useToastContext";
import { useUpload } from "~/hooks/useUpload";
import { getLoggedInUser, updateCurrentUser } from "~/features/users/usersApi";
import { authClient } from "~/auth/authClient";

export function useEditProfile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const updateUser = useServerFn(updateCurrentUser);
    const abortController = useAbortController()
    const { setFiles, upload, isUploading, files } = useUpload()

    const { addToast } = useToastContext()
    const queryClient = useQueryClient()

    const mutation = useMutation(() => ({
        mutationFn: updateUser,
    }))

    const [user, setUser] = createStore({ ...props.user })

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        try {

            const newAvatar = files().find(x => x.field === "avatar")
            const newBanner = files().find(x => x.field === "banner")

            const response = await mutation.mutateAsync({
                data: {
                    ...user,
                    ...newAvatar && ({
                        imageFile: {
                            contentType: newAvatar.file.type,
                            filename: newAvatar.file.name,
                            size: newAvatar.file.size
                        }
                    }),
                    ...newBanner && ({
                        bannerFile: {
                            contentType: newBanner.file.type,
                            filename: newBanner.file.name,
                            size: newBanner.file.size
                        }
                    })
                },
                signal: abortController.signal
            })
            await upload([response.avatar?.signedUrl!, response.banner?.signedUrl!].filter(Boolean))
            setUser(produce(s => {
                if (response.avatar) s.image = response.avatar.key;
                if (response.banner) s.banner = response.banner.key;
            }))
            addToast({ text: "Success", type: "info" })
            queryClient.setQueryData(["users", user.id], user)
            queryClient.setQueryData(["you"], user)            
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