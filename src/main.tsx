import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import awsExports from "@/aws-exports";
import { App } from "@/App";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";
import "@/index.css";

Amplify.configure(awsExports);

// Initialise auth state *after* Amplify is configured — avoids race where
// getCurrentUser() is called before configure()
useAuthStore.getState().initAuth();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
