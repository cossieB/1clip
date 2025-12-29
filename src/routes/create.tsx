import { useQuery } from '@tanstack/solid-query'
import { createFileRoute, redirect } from '@tanstack/solid-router'
import { Suspense } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Form } from '~/components/Forms/Form'
import { FormProvider } from '~/components/Forms/FormContext'
import { UploadBox } from '~/components/UploadBox/UploadBox'
import { useGamesCache } from '~/hooks/useGameCache'
import { getCurrentUser } from '~/serverFn/auth'
import { getGamesFn } from '~/serverFn/games'

export const Route = createFileRoute('/create')({
    component: RouteComponent,
    beforeLoad: async () => {
        const user = await getCurrentUser();
        if (!user) throw redirect({ to: "/auth/signin", search: { redirect: "/create" }, reloadDocument: true })
    },
    loader: async ({ context }) => {
        return await context.queryClient.ensureQueryData({
            queryKey: ["games"],
            queryFn: () => getGamesFn()
        })
    },
})

function RouteComponent() {
    const result = useQuery(() => ({
        queryKey: ["games"],
        queryFn: () => getGamesFn()
    }))

    useGamesCache(result)

    const [input, setInput] = createStore({
        title: "",
        text: "",
        media: [],
        game: null as { gameId: number, title: string } | null,
        tags: [] as string[],
        files: [] as {objectUrl: string, file: File}[]
    })
    return (
        <div class='flexCenter'>
            <FormProvider>
                <Form
                    disabled={!input.title}
                >
                    <Form.Input<typeof input>
                        field="title"
                        setter={val => setInput({ title: val })}
                        value={input.title}
                        required
                    />
                    <UploadBox
                        label='Images'
                        maxSize={2}
                        onSuccess={(files) => setInput({files})}
                        style={{height: "10rem"}}
                        accept={{
                            audio: false,
                            image: true,
                            video: true
                        }}
                        limit={4}
                    />
                    <Form.Textarea<typeof input>
                        field="text"
                        setter={val => setInput({ text: val })}
                        value={input.text}
                        maxLength={255}
                    />
                    <Suspense>
                        <Form.FormSelect<typeof input>
                            selected={input.game ? {label: input.game.title, value: input.game.gameId} : null}
                            list={ result.data!.map(game => ({
                                label: game.title,
                                value: game.gameId
                            }))}
                            required={false}
                            field="game"
                            setter={val => setInput('game', val ? { gameId: val.value as number, title: val.label } : null)}
                        />
                    </Suspense>
                    <Form.TagsInput
                        tagLimit={5}
                        tags={() => input.tags}
                        setTags={tags => setInput({tags})}
                    />
                </Form>
            </FormProvider>
        </div>
    )
}
