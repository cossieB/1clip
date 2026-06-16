import { useParams } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { NotFound } from "~/components/NotFound/NotFound";
import { actorQueryOpts } from "~/features/actors/utils/actorQueryOpts";

export default function ActorId() {
    const {actorId: a} = useParams()
    const actorId = Number(a)
    if (actorId || actorId < 1) return <NotFound />

    const devResult = useQuery(() => actorQueryOpts(actorId))
}