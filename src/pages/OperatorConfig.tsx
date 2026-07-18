import { useState, useCallback, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { graphqlQuery } from "@/services/amplifyClient";
import { listAdminUsers } from "@/graphql/queries";
import type { AdminUser, AdminUsersResponse } from "@/types/graphql";
import { DataTable } from "@/components/ui/DataTable";

// NOTE: "blah" is the correct value here — the Lambda resolver interprets this as the admin
// Cognito user pool identifier (distinct from the end-user pool which uses "USER").
// This matches the original admin app's behavior.
const ADMIN_POOL_ID = "blah";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function OperatorConfigPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await graphqlQuery<{ listAdminUsers: AdminUsersResponse }>(
        listAdminUsers,
        { poolId: ADMIN_POOL_ID }
      );
      const data = res.listAdminUsers;
      setUsers(data.data ?? []);
      setTotalUsers(data.totalUsers ?? data.data?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      key: "userId",
      label: "User ID",
      hideOnMobile: true,
      render: (row: any) => row.userId || "—",
    },
    {
      key: "enabled",
      label: "Enabled",
      render: (row: any) =>
        row.enabled ? (
          <span className="inline-flex items-center gap-1"><CheckCircle size={16} className="text-green-400" /><span className="sr-only">Enabled</span></span>
        ) : (
          <span className="inline-flex items-center gap-1"><XCircle size={16} className="text-red-400" /><span className="sr-only">Disabled</span></span>
        ),
    },
    { key: "name", label: "Username", render: (row: any) => row.name || "—" },
    { key: "email", label: "Email", render: (row: any) => row.email || "—" },
    {
      key: "email_verified",
      label: "Email Verified",
      render: (row: any) =>
        row.email_verified ? (
          <span className="inline-flex items-center gap-1"><CheckCircle size={16} className="text-green-400" /><span className="sr-only">Verified</span></span>
        ) : (
          <span className="text-slate-500">—</span>
        ),
    },
    {
      key: "userStatus",
      label: "Status",
      render: (row: any) => (
        <span className="inline-block rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
          {row.userStatus ?? "—"}
        </span>
      ),
    },
    {
      key: "userCreateDate",
      label: "Register Date",
      hideOnMobile: true,
      render: (row: any) => formatDate(row.userCreateDate),
    },
    {
      key: "userLastModifiedDate",
      label: "Last Modified",
      hideOnMobile: true,
      render: (row: any) => formatDate(row.userLastModifiedDate),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Admin Users
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage admin portal users and their access.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {totalUsers > 0 && (
        <p className="text-sm text-slate-400">
          {totalUsers} user{totalUsers !== 1 ? "s" : ""} in pool
        </p>
      )}

      <DataTable
        columns={columns}
        data={users as any}
        loading={loading}
        error={error}
        onRetry={fetchUsers}
        emptyMessage="No admin users found."
      />
    </div>
  );
}