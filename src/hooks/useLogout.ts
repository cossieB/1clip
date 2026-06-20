import { authClient } from "~/auth/authClient";
import { useToastContext } from "./useToastContext";
import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";

export function useLogout() {
    const navigate = useNavigate()
    const { addToast } = useToastContext()
    const queryClient = useQueryClient()
    return async function logout() {
        try {
            await authClient.signOut();
            await queryClient.invalidateQueries({queryKey: ["you"]})
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