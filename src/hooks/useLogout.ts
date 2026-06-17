import { authClient } from "~/auth/authClient";
import { useToastContext } from "./useToastContext";
import { useNavigate } from "@solidjs/router";

export function useLogout() {
    const navigate = useNavigate()
    const { addToast } = useToastContext()

    return async function logout() {
        try {
            await authClient.signOut();
            navigate("/")
        }
        catch (error) {
            console.error(error)
            addToast({
                text: "Could not log you out. Please try again later.",
                type: "error"
            })
        }
    }
}