import { Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { useQuery } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import { CompanyPage } from "~/components/CompanyPage/CompanyPage";
import { NotFound } from "~/components/NotFound/NotFound";
import { actorQueryOpts } from "~/features/actors/utils/actorQueryOpts";
import { GamesList } from "~/features/games/components/GamesList";
import { STORAGE_DOMAIN } from "~/utils/env";

export default function ActorId() {
    const { actorId: a } = useParams()
    const actorId = Number(a)
    if (!actorId || actorId < 1) return <NotFound />

    const actorResult = useQuery(() => actorQueryOpts(actorId))

    return (
        <Switch>
            <Match when={actorResult.data} >
                <Title> {actorResult.data?.name} </Title>
                <CompanyPage
                    id={actorResult.data!.actorId}
                    logo={STORAGE_DOMAIN + actorResult.data!.photo}
                    name={actorResult.data!.name}
                    summary={actorResult.data!.bio}
                    type='actor'
                    showName
                />
                <GamesList
                    filters={{ actorId }}
                />
            </Match>
            <Match when={actorResult.error}>
                Errored
            </Match>
        </Switch>
    )
}