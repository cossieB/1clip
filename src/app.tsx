import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { ToastProvider } from "./components/Toast/ToastProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

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
        <QueryClientProvider client={client}>
            <Router
                root={props => (
                    <MetaProvider>
                        <ToastProvider>
                            <MainLayout>
                                <ErrorBoundary fallback={e => <span>{e}</span>}>
                                    <Suspense>{props.children}</Suspense>
                                </ErrorBoundary>
                            </MainLayout>
                        </ToastProvider>
                    </MetaProvider>
                )}
            >
                <FileRoutes />
            </Router>
        </QueryClientProvider>
    );
}
