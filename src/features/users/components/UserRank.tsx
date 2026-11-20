import { Accessor, createMemo, Loading } from "solid-js"
import { mediaSrc } from "~/utils/mediaSrc"

export function UserRank(props: {userId: string, enabled: Accessor<boolean>}) {
    const reputation = createMemo(() => getUserReputation(props.userId))

    return (
        <Loading>
            <img src={mediaSrc(`ranks/${reputation().rank}.png`)} alt={reputation().rank} />
            <span>{reputation().xp} XP</span>
        </Loading>
    )
}

function getUserReputation(userId: string) {
    return {
        xp: 0,
        rank: "bronze"
    }
}
