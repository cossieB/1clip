import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

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
export default function App() {
    return (
        <Router
            root={props => (
                <QueryClientProvider client={client}>
                    <MetaProvider>
                        <ToastProvider>
                            <ErrorBoundary fallback={e => <span>{String(e)}</span>}>
                                <MainLayout>
                                    <Suspense>{props.children}</Suspense>
                                </MainLayout>
                            </ErrorBoundary>
                        </ToastProvider>
                    </MetaProvider>
                </QueryClientProvider>
            )}
        >
            <FileRoutes />
        </Router>
    );
}
