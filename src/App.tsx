import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AuthPage } from "@/pages/Auth";
import { DashboardPage } from "@/pages/Dashboard";
import { TitleManagementPage } from "@/pages/TitleManagement";
import { TrackEditorPage } from "@/pages/TrackEditor";
import { UserCommunicationPage } from "@/pages/UserCommunication";
import { UsersOverviewPage } from "@/pages/UsersOverview";
import { UsersFeedbackPage } from "@/pages/UsersFeedback";
import { OperatorConfigPage } from "@/pages/OperatorConfig";

export function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/Auth"
        element={
          <ErrorBoundary>
            <AuthPage />
          </ErrorBoundary>
        }
      />

      {/* Protected routes wrapped in AppShell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/titleManagement"
          element={
            <ErrorBoundary>
              <TitleManagementPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/TrackEditor/:editorState/:titleId?"
          element={
            <ErrorBoundary>
              <TrackEditorPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/UserCommunication"
          element={
            <ErrorBoundary>
              <UserCommunicationPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/OperatorConfig"
          element={
            <ErrorBoundary>
              <OperatorConfigPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/UsersOverview"
          element={
            <ErrorBoundary>
              <UsersOverviewPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/UsersFeedback"
          element={
            <ErrorBoundary>
              <UsersFeedbackPage />
            </ErrorBoundary>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}