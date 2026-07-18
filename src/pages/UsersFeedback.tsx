import { useEffect, useState, useCallback, useMemo } from "react";
import { Star, Search } from "lucide-react";
import { graphqlQuery } from "@/services/amplifyClient";
import { listShazacinUserFeedbacks } from "@/graphql/queries";
import type { ShazacinUserFeedback, ListResponse } from "@/types/graphql";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";

const PAGE_SIZE = 20;

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

function truncate(str?: string, max = 80) {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function StarRating({ rating }: { rating?: number }) {
  const count = rating ?? 0;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= count
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-slate-600"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function UsersFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<ShazacinUserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState<ShazacinUserFeedback | null>(null);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchFeedbacks = useCallback(async (token?: string | null) => {
    try {
      setError(null);
      if (!token) setLoading(true);
      const res = await graphqlQuery<{
        listShazacinUserFeedbacks: ListResponse<ShazacinUserFeedback>;
      }>(listShazacinUserFeedbacks, {
        limit: PAGE_SIZE,
        nextToken: token || undefined,
      });
      const data = res.listShazacinUserFeedbacks;
      if (token) {
        setFeedbacks((prev) => [...prev, ...(data.items ?? [])]);
      } else {
        setFeedbacks(data.items ?? []);
      }
      setNextToken(data.nextToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const filteredFeedbacks = searchQuery.trim()
    ? feedbacks.filter((f) =>
        (f.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : feedbacks;

  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  const sortedFeedbacks = useMemo(() => {
    const sorted = [...filteredFeedbacks];
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
  }, [filteredFeedbacks, sortKey, sortDirection]);

  const columns: import("@/components/ui/DataTable").Column[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "message",
      label: "Message",
      render: (row: Record<string, unknown>) => (
        <span className="text-slate-400" title={String(row.message)}>{truncate(String(row.message))}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row: any) => <StarRating rating={Number(row.rating)} />,
    },
    {
      key: "titleId",
      label: "Title ID",
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (row: any) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">
          Users Feedback
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Browse and review feedback submitted by app users.
        </p>
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
          aria-label="Search feedback by email"
        />
      </div>

      <DataTable
        columns={columns}
        data={sortedFeedbacks as unknown as Record<string, unknown>[]}
        loading={loading}
        error={error}
        onRetry={() => fetchFeedbacks()}
        onRowClick={(row) =>
          setSelectedFeedback(row as unknown as ShazacinUserFeedback)
        }
        emptyMessage={
          searchQuery.trim()
            ? "No feedback matches your search."
            : "No feedback submissions yet."
        }
        nextToken={nextToken}
        onLoadMore={() => fetchFeedbacks(nextToken)}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={selectedFeedback !== null}
        onClose={() => setSelectedFeedback(null)}
        title="Feedback Details"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <p className="mt-0.5 text-sm text-slate-200">
                  {selectedFeedback.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Rating
                </p>
                <div className="mt-0.5">
                  <StarRating rating={selectedFeedback.rating} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Title ID
                </p>
                <p className="mt-0.5 text-sm text-slate-200">
                  {selectedFeedback.titleId || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Date
                </p>
                <p className="mt-0.5 text-sm text-slate-200">
                  {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Message
              </p>
              <p className="mt-0.5 whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
                {selectedFeedback.message || "No message provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
