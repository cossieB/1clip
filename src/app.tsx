import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { NotificationsProvider } from "./features/notifications/components/NotificationsProvider";


export default function App() {
const client = new QueryClient({
    defaultOptions: {
        queries: {
            
            gcTime: Infinity,
            refetchOnMount: false,
            retry: false,
            // retry(failureCount, error) {
            //     return failureCount < 3
            // },
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            throwOnError: true,
        },
    }
})    
    return (
        <Router
            root={props => (
                <QueryClientProvider client={client}>
                    <MetaProvider>
                        <ToastProvider>
                            <NotificationsProvider>

                            {/* <ErrorBoundary fallback={e => <span>{String(e)}</span>}> */}
                                <MainLayout>
                                    <Suspense>{props.children}</Suspense>
                                </MainLayout>
                            {/* </ErrorBoundary> */}
                            </NotificationsProvider>
                        </ToastProvider>
                    </MetaProvider>
                </QueryClientProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
