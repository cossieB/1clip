import { MySiteTitle } from "~/components/MySiteTitle";
import { SecurityPage } from "~/features/users/components/SecurityPage";

export default function SecurityRoute() {
    return (
        <>
            <MySiteTitle>Security</MySiteTitle>
            <SecurityPage />
        </>
    )
}