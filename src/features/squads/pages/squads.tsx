import { httpHeader } from "@solidjs/web";
import { SquadList } from "../components/SquadList";

export function SquadsPage() {
    httpHeader("Cache-Control", "private, max-age=600")    
    return <SquadList />
}