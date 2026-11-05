import { isPending, Loading, Show } from "solid-js";
import z from "zod";
import { ItemList } from "~/components/Forms/ItemList";
import { TextArea } from "~/components/Forms/Textarea";
import { TextField } from "~/components/Forms/Textfield";
import { session, useLogout } from "~/features/auth/authApi";
import { Spinner } from "~/components/Loader/Spinner";
import { UpdateUserSchema } from "../utils/zod";
import { useProfile } from "../hooks/useProfile";
import { HoldClickBtn } from "~/components/HoldClickBtn/HoldClickBtn";
import { DropZone } from "~/components/Forms/DropZone";
import styles from "./ProfilePage.module.css"

export default function ProfilePage() {
    const { isSubmitting, updateUserAction, input, setInput } = useProfile()

    const isDisabled = () => !UpdateUserSchema.safeParse(input).success || isSubmitting()
    const logout = useLogout()
    return (
        <Loading fallback={<Spinner />} >

            <form
                class="form card"
                onSubmit={async e => {
                    e.preventDefault()
                    await updateUserAction()
                }}
            >
                <div
                    class={styles.files}
                >
                    <DropZone
                        setFile={f => { }}
                        image={input.image}
                    />
                    <DropZone
                        setFile={f => { }}
                        image={input.banner}
                    />
                </div>
                <TextField
                    label="Display Name"
                    value={input.displayName}
                    onChange={e => setInput(s => {
                        s.displayName = e.currentTarget.value
                    })}
                    maxlength={15}
                />
                <TextArea
                    label="Bio"
                    maxLength={255}
                    style={{ width: "100%" }}
                    value={input.bio}
                    onChange={e => setInput(s => {
                        s.bio = e.currentTarget.value
                    })}
                />
                <TextField
                    label="Location"
                    maxlength={50}
                    value={input.location ?? undefined}
                    onChange={e => setInput(s => {
                        s.location = e.currentTarget.value
                    })}
                />
                <TextField
                    type="date"
                    label="D.O.B"
                    value={input.dob ?? undefined}
                    schema={UpdateUserSchema.shape.dob}
                    onChange={e => setInput(s => {
                        s.dob = e.currentTarget.value
                    })}
                />
                <ItemList
                    label="Socials"
                    maxItems={5}
                    schema={z.url()}
                    type="url"
                    value={input.links}
                    onChange={links => setInput(s => {
                        s.links = links
                    })}
                    hint='Link to your social profiles including the "https://"'
                />
                <button
                    class="secondary"
                    type="submit"
                    disabled={isDisabled()}
                >
                    <Show when={isSubmitting()} fallback="Submit">
                        <Spinner size="small" />
                    </Show>
                </button>
            </form>
            <HoldClickBtn
                action={logout}
                label="Log Out"
                variant="danger"
                disabled={isPending(session)}
                style={{ width: "100%", "margin-top": "1rem" }}

            />
        </Loading>
    )
}