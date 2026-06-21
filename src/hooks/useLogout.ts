import { authClient } from "~/auth/authClient";
import { useToastContext } from "./useToastContext";
import { revalidate, useNavigate } from "@solidjs/router";
import { getActiveSession } from "~/services/authService";
import { useQueryClient } from "@tanstack/solid-query";

export function useLogout() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { addToast } = useToastContext()
    
    return async function logout() {
        try {
            await authClient.signOut();
            await revalidate(getActiveSession.key)
            queryClient.clear()
            navigate("/posts")
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