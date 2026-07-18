import type { ReactNode } from "react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Search, Download, Loader2 } from "lucide-react";
import clsx from "clsx";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => ReactNode;
  hideOnMobile?: boolean;
}

export interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  onRowClick?: (row: Record<string, unknown>) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  nextToken?: string | null;
  onLoadMore?: () => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  searchable?: boolean;
  onSearch?: (query: string) => void;
  exportable?: boolean;
  exportFilename?: string;
}

export function DataTable({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "No data found.",
  onRowClick,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  nextToken,
  onLoadMore,
  onSort,
  sortKey,
  sortDirection,
  searchable = false,
  onSearch,
  exportable = false,
  exportFilename = "export.csv",
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        onSearch?.(value);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const getId = (row: Record<string, unknown>) =>
    String(row.titleId ?? row.trackId ?? row.notificationId ?? row.feedbackId ?? row.userId ?? row.id ?? "");

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    const allIds = data.map((r) => getId(r));
    if (allIds.every((id) => selectedIds.has(id))) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(allIds));
    }
  }, [data, selectedIds, onSelectionChange]);

  const toggleRow = useCallback(
    (row: Record<string, unknown>) => {
      if (!onSelectionChange) return;
      const id = getId(row);
      const next = new Set(selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange]
  );

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;
      const newDir =
        sortKey === key && sortDirection === "asc" ? "desc" : "asc";
      onSort(key, newDir);
    },
    [onSort, sortKey, sortDirection]
  );

  const handleExport = useCallback(() => {
    const visible = columns.filter((c) => c.key !== "__select__");
    const header = visible.map((c) => c.label).join(",");
    const rows = data.map((row) =>
      visible.map((c) => {
        const val = row[c.key];
        const str = val == null ? "" : String(val);
        return str.includes(",") ? `"${str}"` : str;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [columns, data, exportFilename]);

  const allSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((r) => selectedIds.has(getId(r)));
  }, [data, selectedIds]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-800 bg-red-950/30 p-8">
        <p className="mb-4 text-sm text-red-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-800 px-4 py-2 text-sm text-red-100 transition-colors hover:bg-red-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (loading && data.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-slate-800"
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 p-12">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
                aria-label="Search"
              />
            </div>
          )}
          {exportable && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-800 md:block">
        <table className="w-full text-left text-sm" role="grid" aria-label="Data table">
          <thead className="border-b border-slate-800 bg-slate-900/50">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3" scope="col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-slate-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={clsx(
                    "px-4 py-3 font-medium text-slate-400",
                    col.hideOnMobile && "hidden md:table-cell",
                    (col.sortable && onSort) &&
                      "cursor-pointer select-none hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  )}
                  tabIndex={col.sortable && onSort ? 0 : undefined}
                  role={col.sortable && onSort ? "button" : undefined}
                  onClick={() => col.sortable && onSort && handleSort(col.key)}
                  onKeyDown={(e) => {
                    if (col.sortable && onSort && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                  aria-sort={
                    sortKey === col.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  aria-label={col.sortable && onSort ? `Sort by ${col.label}` : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      sortDirection === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((row, idx) => {
              const rowId = getId(row) || String(idx);
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={clsx(
                    "transition-colors hover:bg-slate-800/50 focus:ring-2 focus:ring-inset focus:ring-slate-500 focus:outline-none",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rowId)}
                        onChange={() => toggleRow(row)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-slate-500"
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        "px-4 py-2.5 text-slate-300",
                        col.hideOnMobile && "hidden md:table-cell"
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {data.map((row, idx) => {
          const rowId = getId(row) || String(idx);
          return (
            <div
              key={rowId}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onRowClick(row);
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              aria-label={onRowClick ? `Row ${rowId}` : undefined}
              className={clsx(
                "rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:bg-slate-800/50 focus:ring-2 focus:ring-slate-500 focus:outline-none",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-between py-1 text-sm"
                  >
                    <span className="text-slate-500">{col.label}</span>
                    <span className="text-slate-300">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </span>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {nextToken && onLoadMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
