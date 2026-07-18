import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/Auth" replace />;
  }

  return <>{children}</>;
}
