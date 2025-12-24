import { createStore } from "solid-js/store";
import { getLoggedInUser } from "~/services/userService";
import { Form } from "../Forms/Form";
import { FormProvider } from "../Forms/FormContext";
import styles from "./ProfilePage.module.css"
import { ConfirmPopover } from "../Popover/Popover";
import { useToastContext } from "~/hooks/useToastContext";
import { UploadBox } from "../UploadBox/UploadBox";
import { objectDifference } from "~/lib/objectDifference";
import { updateCurrentUser } from "~/services/userService";
import { useServerFn } from "@tanstack/solid-start";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useLogout } from "~/hooks/useLogout";
import { onCleanup } from "solid-js";

export function Profile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const action = useServerFn(updateCurrentUser);
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const logout = useLogout()
    const abortController = new AbortController()

    onCleanup(() => {
        abortController.abort()
    })

    const mutation = useMutation(() => ({
        mutationFn: action,
        onSuccess: () => {
            addToast({ text: "Success", type: "info" })
            queryClient.setQueryData(["users", user.userId], user)
            queryClient.setQueryData(["you"], user)
        },
        onError(error) {
            addToast({ text: error.message, type: "error" })
        },
    }))

    const [user, setUser] = createStore<typeof props.user>(JSON.parse(JSON.stringify(props.user)))
    const [files, setFiles] = createStore<{avatar?: File, banner?: File}>({})

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        const obj = objectDifference(user, props.user);
        if (Object.keys(obj).length == 0) return addToast({ text: "Nothing to update", type: "warning" });
        const fd = new FormData()
        console.log(files.avatar, files.banner)
        files.avatar && fd.append("image", files.avatar)
        files.banner && fd.append("banner", files.banner)
        const res = await mutation.mutateAsync({ 
            data: fd, 
            signal: abortController.signal })

    }

    return (
        <div class={`${styles.profile} flexCenter`}>
            <img src="https://r2.cossie.dev/users/019b4b5c-d7db-7e08-9afb-86af0733445c/avatars/v83849tobz7f1.jpeg" alt="" />
            <FormProvider>
                <Form onSubmit={handleSubmit} isPending={mutation.isPending}>
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
                            onSuccess={(src, file) => {
                                setUser({ image: src })
                                setFiles({avatar: file})
                            }}
                            maxSize={1}
                        />
                        <UploadBox
                            label="Banner"
                            onSuccess={(src, file) => {
                                setUser({ banner: src })
                                setFiles({banner: file})
                            }}
                            maxSize={1}
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