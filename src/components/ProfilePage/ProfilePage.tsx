import { createStore, unwrap } from "solid-js/store";
import { getLoggedInUser } from "~/serverFn/users";
import { Form } from "../Forms/Form";
import { FormProvider } from "../Forms/FormContext";
import styles from "./ProfilePage.module.css"
import { ConfirmPopover } from "../Popover/Popover";
import { useToastContext } from "~/hooks/useToastContext";
import { UploadBox } from "../UploadBox/UploadBox";
import { objectDifference } from "~/lib/objectDifference";
import { updateCurrentUser } from "~/serverFn/users";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useLogout } from "~/hooks/useLogout";
import { createSignal, mergeProps, onCleanup } from "solid-js";
import { getProfileSignedUrl } from "~/services/uploadService";
import { uploadToSignedUrl } from "~/utils/uploadToSignedUrl";

export function Profile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const updateUser = useServerFn(updateCurrentUser);
    const getAvatarSignedUrl = useServerFn(getProfileSignedUrl)
    const getBannerSignedUrl = useServerFn(getProfileSignedUrl)

    const keys: { image?: string, banner?: string } = {}

    async function getUrl(cb: typeof getAvatarSignedUrl, file: File, field: "image" | "banner") {
        const res = await cb({
            data: {
                contentLength: file.size,
                contentType: file.type,
                filename: file.name
            },
            signal: abortController.signal
        })

        setFiles(field, { file, signedUrl: res.signedUrl })
        keys[field] = import.meta.env.VITE_STORAGE_DOMAIN + res.key
    }

    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const logout = useLogout()
    const abortController = new AbortController()

    onCleanup(() => {
        abortController.abort()
    })

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

    const [user, setUser] = createStore(mergeProps(props.user))
    const [isUploading, setIsUploading] = createSignal(false)
    const [files, setFiles] = createStore<NewType>({})

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        try {
            setIsUploading(true)
            await Promise.all([
                files.image && uploadToSignedUrl(files.image.signedUrl, files.image.file, { signal: abortController.signal }),
                files.banner && uploadToSignedUrl(files.banner.signedUrl, files.banner.file, { signal: abortController.signal })
            ])
            if (keys.banner) setUser('banner', keys.banner)
            if (keys.image) setUser('image', keys.image)

            const obj = objectDifference(user, props.user)
            if (Object.keys(obj).length === 0) return addToast({text: "Nothing to update", type: "warning"})

            await mutation.mutateAsync({ data: obj, signal: abortController.signal },)
        }
        catch (error) {
            addToast({ text: "Something went wrong. Please try again later", type: "error" })
        }
        finally {
            setIsUploading(false)
        }
    }

    return (
        <div class={`${styles.profile} flexCenter`}>
            <FormProvider>
                <Form onSubmit={handleSubmit} isPending={mutation.isPending || isUploading()}>
                    <Form.Input<typeof user>
                        field="displayName"
                        label='Display Name'
                        setter={val => setUser({ displayName: val })}
                        value={user.displayName}
                        required
                    />
                    <div class={styles.images}>
                        <UploadBox
                            label="Avatar"
                            onSuccess={(files) => {
                                const file = files.at(0)
                                if (!file) return
                                setUser({ image: file.objectUrl })
                                getUrl(getAvatarSignedUrl, file.file, 'image')
                            }}
                            maxSize={1}
                            limit={1}
                            accept={{
                                image: true,
                                audio: false,
                                video: false
                            }}
                        />
                        <UploadBox
                            label="Banner"
                            onSuccess={files => {
                                const file = files.at(0)
                                if (!file) return
                                setUser({ banner: file.objectUrl })
                                getUrl(getBannerSignedUrl, file.file, 'banner')
                            }}
                            maxSize={1}
                            limit={1}
                            accept={{
                                image: true,
                                audio: false,
                                video: false
                            }}
                        />
                        <div class={styles.preview}>
                            <div><img src={user.image ?? ""} /></div>
                            <div><img src={user.banner ?? ""} /></div>
                        </div>
                    </div>
                    <Form.Textarea<typeof user>
                        field="bio"
                        label='Bio'
                        setter={val => setUser({ bio: val })}
                        value={user.bio}
                        maxLength={255}
                    />
                    <Form.Input<typeof user>
                        field="location"
                        setter={val => setUser({ location: val })}
                        value={user.location ?? ""}
                    />
                    <Form.Input<typeof user>
                        field="dob"
                        setter={val => setUser({ dob: val })}
                        value={user.dob ?? ""}
                        type="date"
                    />
                </Form>
            </FormProvider>
            <button class={styles.dangerBtn} popoverTarget="autoPopover">
                Logout
            </button>

            <ConfirmPopover
                text="Are you sure you want to logout?"
                onConfirm={logout}
            />
        </div>
    )
}

type NewType = {
    image?: {
        file: File
        signedUrl: string
    };
    banner?: {
        file: File
        signedUrl: string
    };
};