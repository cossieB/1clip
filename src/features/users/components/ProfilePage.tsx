import { getLoggedInUser } from "~/serverFn/users";
import styles from "./ProfilePage.module.css"
import { Form } from "~/components/Forms/Form";
import { UploadBox } from "~/components/UploadBox/UploadBox";
import { ConfirmPopover } from "~/components/Popover/Popover";
import { useEditProfile } from "../hooks/useEditProfile";
import { useLogout } from "~/hooks/useLogout";
import { STORAGE_DOMAIN } from "~/utils/env";

export function Profile(props: { user: Awaited<ReturnType<typeof getLoggedInUser>> }) {
    const {
        handleSubmit,
        mutation,
        setUser,
        getSignedUrl,
        uploadState,
        user,
        setFiles
    } = useEditProfile(props)

    const logout = useLogout()
    setFiles(new Array(2))
    return (
        <div class={`${styles.profile} flexCenter`}>
            <Form onSubmit={handleSubmit} isPending={mutation.isPending || uploadState.isUploading}>
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
                            const obj = await getSignedUrl({
                                data: {
                                    contentLength: file.file.size,
                                    contentType: file.file.type,
                                    filename: file.file.name
                                }
                            })
                            const updated = uploadState.images.toSpliced(0, 1, { ...obj, file: file.file })
                            setFiles(updated)
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
                            const obj = await getSignedUrl({
                                data: {
                                    contentLength: file.file.size,
                                    contentType: file.file.type,
                                    filename: file.file.name
                                }
                            })
                            const updated = uploadState.images.toSpliced(1, 1, { ...obj, file: file.file })
                            setFiles(updated)
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
            </Form>
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