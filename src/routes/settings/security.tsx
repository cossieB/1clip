import { Title } from "@solidjs/meta";
import { SecurityPage } from "~/features/users/components/SecurityPage";

export default function SecurityRoute() {
    return (
        <>
            <Title>Security</Title>
            <SecurityPage />
        </>
    )
}