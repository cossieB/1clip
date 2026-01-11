import { getLoggedInUser } from "~/serverFn/users";
import styles from "./ProfilePage.module.css"
import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { ConfirmPopoverWithButton } from "~/components/Popover/Popover";
import { useEditProfile } from "../hooks/useEditProfile";
import { useLogout } from "~/hooks/useLogout";
import { STORAGE_DOMAIN } from "~/utils/env";
import { For } from "solid-js";
import { XIcon } from "lucide-solid";
import { validateUrl } from "~/lib/validateUrl";
import { useToastContext } from "~/hooks/useToastContext";
import { InputWithPlusBtn } from "~/components/Forms/InputWithPlusBtn";

export function Profile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const {
        handleSubmit,
        mutation,
        setUser,
        user,
        setFiles,
        isUploading
    } = useEditProfile(props)

    const {addToast} = useToastContext()
    const logout = useLogout()

    return (
        <div class={`${styles.profile} flexCenter`}>
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
                        onSuccess={async files => {
                            const file = files.at(0)
                            if (!file) return
                            setUser({ image: file.objectUrl })
                            setFiles(prev => [...prev.filter(x => x.field != "avatar"), { ...file, field: "avatar" }])
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
                        onSuccess={async files => {
                            const file = files.at(0)
                            if (!file) return
                            setUser({ banner: file.objectUrl })
                            setFiles(prev => [...prev.filter(x => x.field != "banner"), { ...file, field: "banner" }])
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
                        <div><img src={user.image.startsWith("blob:") ? user.image : STORAGE_DOMAIN + user.image} /></div>
                        <div><img src={user.banner.startsWith("blob:") ? user.banner : STORAGE_DOMAIN + user.banner} /></div>
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
                <InputWithPlusBtn
                    arr={user.links}
                    disabled={user.links.length >= 5}
                    label="Add link"
                    onAdd={val => {
                        const link = validateUrl(val)
                        if (!link) return addToast({text: "Invalid link. Copy and paste your link here including the \"https\"", type: "info"})
                        if (user.links.includes(val)) return 
                        setUser('links', prev => [...prev, val])
                    }}
                />
                <ul>
                    <For each={user.links}>
                        {link =>
                            <li style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }} >
                                <span>{link}</span>
                                <button

                                    style={{ margin: 0, color: "red" }}
                                    type="button"
                                    onClick={() => setUser('links', prev => prev.filter(x => x != link))}
                                >
                                    <XIcon />
                                </button>
                            </li>}
                    </For>
                </ul>
            </Form>

            <ConfirmPopoverWithButton
                popover={{
                    text: "Are you sure you want to logout?",
                    onConfirm: logout,
                    id: "logout-warn"
                }}
                button={{
                    class: styles.dangerBtn,
                    children: "Logout"
                }}
            />
        </div>
    )
}