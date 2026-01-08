import { createFileRoute } from '@tanstack/solid-router'
import { Form } from '~/components/Forms/Form'

export const Route = createFileRoute('/games/$gameId/edit')({
    component: RouteComponent,
    loader: async ({context, params}) => {
        
    }
})

function RouteComponent() {
    return (
        <Form>

        </Form>
    )
}
