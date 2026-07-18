import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Film, CheckCircle, Loader2 } from "lucide-react";
import { graphqlQuery, graphqlMutation } from "@/services/amplifyClient";
import { listShazacinMetadataTitles } from "@/graphql/queries";
import { deleteShazacinMetadataTitles } from "@/graphql/mutations";
import type { ShazacinMetadataTitle, ListResponse } from "@/types/graphql";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/forms/Select";
import { useToastStore } from "@/stores/toastStore";
import { typeOptions as allTypeOptions } from "@/data/uiDataSets";

const POSTER_BASE = import.meta.env.VITE_CDN_DOMAIN || "https://your-cdn-domain.com";

const PAGE_SIZE = 20;

const typeFilterOptions = [
  { value: "", label: "All Types" },
  ...allTypeOptions,
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function PosterCell({ row }: { row: any }) {
  const [imgError, setImgError] = useState(false);
  const images = row.images as string[] | string | undefined;
  const firstImage = Array.isArray(images) ? images[0] : typeof images === "string" && images ? images : null;

  if (!firstImage || imgError) {
    return (
      <div className="flex h-[50px] w-[50px] items-center justify-center rounded bg-slate-800 text-slate-500" aria-label="No poster available">
        <Film size={20} />
      </div>
    );
  }

  return (
    <img
      src={`${POSTER_BASE}/${firstImage}`}
      alt=""
      className="h-[50px] w-[50px] rounded object-cover"
      onError={() => setImgError(true)}
    />
  );
}

function FingerprintingCell({ row }: { row: any }) {
  const type = row.type as string | undefined;
  if (type === "book" || type === "series" || type === "chapter") {
    return <span className="text-slate-500">—</span>;
  }

  const progress = row.fingerprinting_progress as string | undefined;

  if (progress === "completed") {
    return <span className="inline-flex items-center gap-1"><CheckCircle size={18} className="text-green-400" /><span className="sr-only">Completed</span></span>;
  }
  if (progress === "in-progress") {
    return <span className="inline-flex items-center gap-1"><Loader2 size={18} className="animate-spin text-blue-400" /><span className="sr-only">In progress</span></span>;
  }
  return <span className="text-slate-500">—</span>;
}

export function TitleManagementPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [titles, setTitles] = useState<ShazacinMetadataTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ShazacinMetadataTitle | null>(null);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchTitles = useCallback(async (token?: string | null, append?: boolean) => {
    try {
      setError(null);
      if (!append) setLoading(true);
      const filter: Record<string, unknown> = {};
      if (typeFilter) {
        filter.type = { eq: typeFilter };
      }
      const res = await graphqlQuery<{
        listShazacinMetadataTitles: ListResponse<ShazacinMetadataTitle>;
      }>(listShazacinMetadataTitles, {
        filter: Object.keys(filter).length ? filter : undefined,
        limit: PAGE_SIZE,
        nextToken: token || undefined,
      });
      const data = res.listShazacinMetadataTitles;
      if (append && token) {
        setTitles((prev) => [...prev, ...(data.items ?? [])]);
      } else {
        setTitles(data.items ?? []);
      }
      setNextToken(data.nextToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load titles");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await graphqlMutation(deleteShazacinMetadataTitles, {
        input: { titleId: deleteTarget.titleId },
      });
      addToast({ type: "success", message: `"${deleteTarget.title}" deleted` });
      setDeleteTarget(null);
      setTitles((prev) => prev.filter((t) => t.titleId !== deleteTarget.titleId));
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete title",
      });
    }
  };

  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  const sortedTitles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = titles;
    if (query) {
      filtered = titles.filter((t) => {
        const searchFields = [
          t.title,
          t.type,
          t.year?.toString(),
          t.genre,
          t.synopsis,
          ...(t.categories ?? []),
          ...(t.actors ?? []),
          ...(t.directors ?? []),
          ...(t.writers ?? []),
        ];
        return searchFields.some((f) => f && String(f).toLowerCase().includes(query));
      });
    }
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aVal = a[sortKey as keyof ShazacinMetadataTitle];
      const bVal = b[sortKey as keyof ShazacinMetadataTitle];
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
  }, [titles, sortKey, sortDirection, searchQuery]);

  const columns = [
    {
      key: "poster",
      label: "Poster",
      render: (row: any) => <PosterCell row={row} />,
    },
    {
      key: "fingerprinting_progress",
      label: "Fingerprinting",
      render: (row: any) => <FingerprintingCell row={row} />,
    },
    {
      key: "categories",
      label: "Categories",
      render: (row: any) => {
        const cats = row.categories as string[] | undefined;
        if (!cats || cats.length === 0) return <span className="text-slate-500">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {cats.map((cat: string) => (
              <span
                key={cat}
                className="inline-block rounded-full border border-blue-800 bg-blue-950/50 px-2 py-0.5 text-xs font-medium text-blue-400"
              >
                {cat}
              </span>
            ))}
          </div>
        );
      },
    },
    { key: "title", label: "Title", sortable: true },
    {
      key: "type", label: "Type", sortable: true,
      render: (row: any) => (
        <span className="inline-block rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
          {row.type ?? "—"}
        </span>
      ),
    },
    { key: "year", label: "Year", sortable: true, hideOnMobile: true },
    {
      key: "publicEnabled", label: "Status",
      render: (row: any) => (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${row.publicEnabled ? "border-green-800 bg-green-950/50 text-green-400" : "border-amber-800 bg-amber-950/50 text-amber-400"}`}>
          {row.publicEnabled ? "Live" : "Draft"}
        </span>
      ),
    },
    { key: "createdAt", label: "Created", sortable: true, hideOnMobile: true, render: (row: any) => formatDate(row.createdAt) },
    {
      key: "actions", label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/TrackEditor/edit/${row.titleId}`); }}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none" aria-label={`Edit ${row.title}`}>
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as ShazacinMetadataTitle); }}
            className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-300 focus:ring-2 focus:ring-slate-500 focus:outline-none" aria-label={`Delete ${row.title}`}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Title Management</h2>
          <p className="mt-1 text-sm text-slate-500">Manage movies, TV shows, and books with their AD tracks.</p>
        </div>
        <button onClick={() => navigate("/TrackEditor/new")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none">
          <Plus size={16} /> Add Title
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search titles..."
          className="flex-1 max-w-xs rounded-lg border border-slate-700 bg-slate-900 py-2 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none" aria-label="Search titles" />
        <div className="w-40">
          <Select label="Filter by type" options={typeFilterOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        </div>
        <button onClick={() => { setSearchQuery(""); setTypeFilter(""); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors focus:ring-2 focus:ring-slate-500 focus:outline-none rounded">Clear filters</button>
      </div>

      <DataTable
        columns={columns}
        data={sortedTitles as any}
        loading={loading}
        error={error}
        onRetry={() => fetchTitles()}
        emptyMessage="No titles found."
        nextToken={nextToken}
        onLoadMore={() => fetchTitles(nextToken, true)}
        onRowClick={(row: any) => navigate(`/TrackEditor/edit/${row.titleId}`)}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

      <ConfirmDialog isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Title" message={`Are you sure you want to delete "${deleteTarget?.title ?? "Untitled"}"? This will also remove all associated AD tracks. This action cannot be undone.`}
        confirmText="Delete" destructive />
    </div>
  );
}