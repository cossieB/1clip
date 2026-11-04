import { createEffect, createMemo, createStore, Loading } from "solid-js";
import z from "zod";
import { ItemList } from "~/components/Forms/ItemList";
import { TextArea } from "~/components/Forms/Textarea";
import { TextField } from "~/components/Forms/Textfield";
import { getYou } from "../userApi";
import { session } from "~/features/auth/authApi";
import { useNavigate } from "@solidjs/router";
import { paths } from "~/router";
import { Spinner } from "~/components/Loader/Spinner";

const ProfileSchema = z.object({
    displayName: z.string().max(15),
    bio: z.string().max(255).default(""),
    location: z.string().max(50).nullish(),
    dob: z.iso.date().nullish(),
    links: z.url().array().max(5).default([]).catch([])
})

export default function ProfilePage() {
    const user = createMemo(() => getYou())
    const navigate = useNavigate()
    createEffect(() => session().data, (s) => {
        if (!s) navigate(paths({ dialog: "signin" }))
    })

    const [input, setInput] = createStore(() => user() as unknown as z.infer<typeof ProfileSchema>, {
        displayName: "",
        bio: "",
        location: "",
        dob: "",
        links: []
    },)

    const isDisabled = () => !ProfileSchema.safeParse(input).success

    return (
        <Loading fallback={<Spinner />} on={[session(), user()]}>
            <form class="form card">
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
                    max={50}
                    value={input.location ?? undefined}
                    onChange={e => setInput(s => {
                        s.location = e.currentTarget.value
                    })}
                />
                <TextField
                    type="date"
                    label="D.O.B"
                    value={input.dob ?? undefined}
                    onChange={e => setInput(s => {
                        s.dob = e.currentTarget.value
                    })}
                />
                <ItemList
                    label="Socials"
                    maxItems={5}
                    schema={z.url()}
                    value={input.links}
                    onChange={links => setInput(s => {
                        s.links = links
                    })}
                />
                <button
                    class="secondary"
                    type="submit"
                    disabled={isDisabled()}
                >
                    Submit
                </button>
            </form>
        </Loading>
    )
}