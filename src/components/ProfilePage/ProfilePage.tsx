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

export function Profile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const action = useServerFn(updateCurrentUser);
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    const logout = useLogout()

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

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        const obj = objectDifference(user, props.user);
        if (Object.keys(obj).length == 0) return addToast({text: "Nothing to update", type: "warning"});
        const res = await mutation.mutateAsync({ data: obj })
 
    }

    return (
        <div class={`${styles.profile} flexCenter`}>
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
                            onSuccess={src => setUser({ image: src })}
                            maxSize={1}
                        />
                        <UploadBox
                            label="Banner"
                            onSuccess={src => setUser({ banner: src })}
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