import { useEffect, useState, useCallback, useMemo } from "react";
import { RefreshCw, Search, CheckCircle } from "lucide-react";
import { graphqlQuery } from "@/services/amplifyClient";
import { listAdminUsers } from "@/graphql/queries";
import type { AdminUser, AdminUsersResponse } from "@/types/graphql";
import { DataTable } from "@/components/ui/DataTable";

const POOL_ID = "USER";

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

export function UsersOverviewPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortKey, setSortKey] = useState<string>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await graphqlQuery<{ listAdminUsers: AdminUsersResponse }>(
        listAdminUsers,
        { poolId: POOL_ID }
      );
      const data = res.listAdminUsers;
      setUsers(data.data ?? []);
      setTotalUsers(data.totalUsers ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = searchQuery.trim()
    ? users.filter((u) =>
        (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [filteredUsers, sortKey, sortDirection]);

  const columns: import("@/components/ui/DataTable").Column[] = [
    {
      key: "userId",
      label: "User ID",
      hideOnMobile: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "name",
      label: "Name",
      hideOnMobile: true,
    },
    {
      key: "userStatus",
      label: "Status",
      sortable: true,
      render: (row: Record<string, unknown>) => {
        const status = String(row.userStatus ?? "unknown");
        const colorMap: Record<string, string> = {
          CONFIRMED: "text-green-400 bg-green-950/50 border-green-800",
          UNCONFIRMED: "text-yellow-400 bg-yellow-950/50 border-yellow-800",
          ARCHIVED: "text-slate-400 bg-slate-800/50 border-slate-700",
          COMPROMISED: "text-red-400 bg-red-950/50 border-red-800",
          RESET_REQUIRED: "text-orange-400 bg-orange-950/50 border-orange-800",
          FORCE_CHANGE_PASSWORD: "text-orange-400 bg-orange-950/50 border-orange-800",
        };
        const classes = colorMap[status] ?? "text-slate-400 bg-slate-800/50 border-slate-700";
        return (
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "userCreateDate",
      label: "Created Date",
      hideOnMobile: true,
      sortable: true,
      render: (row: Record<string, unknown>) => formatDate(String(row.userCreateDate)),
    },
    {
      key: "enabled",
      label: "Enabled",
      render: (row: Record<string, unknown>) => {
        const isEnabled = !!row.enabled;
        return (
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isEnabled
                ? "border-green-800 bg-green-950/50 text-green-400"
                : "border-red-800 bg-red-950/50 text-red-400"
            }`}
          >
            {isEnabled ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      key: "email_verified",
      label: "Email Verified",
      render: (row: Record<string, unknown>) => {
        const isVerified = row.email_verified === "true" || row.email_verified === true;
        return isVerified ? (
          <span className="inline-flex items-center gap-1"><CheckCircle size={16} className="text-green-400" /><span className="sr-only">Verified</span></span>
        ) : (
          <span className="text-slate-500">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Users Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {totalUsers > 0
              ? `${totalUsers} total user${totalUsers !== 1 ? "s" : ""} in the user pool`
              : "Browse Cognito user pool accounts."}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
          aria-label="Search users by email"
        />
      </div>

      <DataTable
        columns={columns}
        data={sortedUsers as unknown as Record<string, unknown>[]}
        loading={loading}
        error={error}
        onRetry={fetchUsers}
        emptyMessage={
          searchQuery.trim()
            ? "No users match your search."
            : "No users found in the pool."
        }
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />
    </div>
  );
}
