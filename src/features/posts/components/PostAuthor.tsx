import { STORAGE_DOMAIN } from "~/utils/env"
import { Link } from '@tanstack/solid-router'
import { UserMiniProfile } from "~/features/users/components/MiniProfile"

type Props = {
    entityId: string | number
    user: {
        displayUsername: string
        image: string
        id: string
    }
    class: string
}

export function PostAuthor(props: Props) {
    let timerId: number | undefined
    return (
        <>
            <div class={props.class} >
                <div
                    style={{ "anchor-name": "--postAuthor" + props.entityId }}
                    onMouseEnter={(e) => {
                        window.clearTimeout(timerId)
                        e.preventDefault()
                        timerId = window.setTimeout(() => {
                            document.getElementById("post-author-popover" + props.entityId)?.showPopover()
                        }, 300)
                    }}
                    onMouseLeave={e => {
                        window.clearTimeout(timerId)
                        timerId = window.setTimeout(() => {
                            document.getElementById("post-author-popover" + props.entityId)?.hidePopover()
                        }, 300)
                    }}
                >
                    <img src={STORAGE_DOMAIN + props.user.image} />
                    <span data-for="user">{props.user.displayUsername}</span>
                    <Link to='/users/$username' params={{ username: props.user.displayUsername! }} />
                    <UserMiniProfile entityId={props.entityId} userId={props.user.id} />
                </div>
            </div>
        </>
    )
}

