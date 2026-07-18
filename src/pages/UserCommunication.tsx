import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { graphqlQuery, graphqlMutation } from "@/services/amplifyClient";
import {
  listShazacinUserNotifications,
  listAdminUsers,
} from "@/graphql/queries";
import {
  createShazacinUserNotifications,
  deleteShazacinUserNotifications,
} from "@/graphql/mutations";
import type {
  ShazacinUserNotification,
  ListResponse,
  AdminUser,
  AdminUsersResponse,
} from "@/types/graphql";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TextInput } from "@/components/forms/TextInput";
import { TextArea } from "@/components/forms/TextArea";
import { useToastStore } from "@/stores/toastStore";
import { notificationIcons, notificationColors } from "@/data/uiDataSets";
import { getNotificationIcon } from "@/data/notificationIconMap";
import { getCurrentUser } from "aws-amplify/auth";

const PAGE_SIZE = 20;
const POOL_ID = "USER";

const colorDotMap: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  purple: "#a855f7",
};

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

interface NotificationForm {
  title: string;
  heading: string;
  message: string;
  color: string;
  icon: string;
  imageUrl: string;
  link: string;
  userId: string;
  ttl: string; // stored as seconds for API, but UI uses expiry date
  sendPush: boolean;
}

const emptyForm: NotificationForm = {
  title: "",
  heading: "",
  message: "",
  color: "blue",
  icon: "",
  imageUrl: "",
  link: "",
  userId: "",
  ttl: "604800",
  sendPush: false,
};

const getDefaultExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 16);
};

function NotificationPreview({ form }: { form: NotificationForm }) {
  const borderColor = colorDotMap[form.color] ?? colorDotMap.blue;
  const IconComponent = form.icon ? getNotificationIcon(form.icon) : null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-4 max-h-[200px] overflow-y-auto">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Live Preview
      </h3>
      <div
        className="flex gap-3 rounded-md border border-slate-700 bg-slate-900 p-3"
        style={{ borderLeftColor: borderColor, borderLeftWidth: "4px" }}
      >
        {/* Icon badge */}
        {form.icon && (
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${borderColor}22`, color: borderColor }}
          >
            {IconComponent ? <IconComponent size={16} /> : form.icon}
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title row */}
          {form.title && (
            <p className="truncate text-sm font-semibold text-slate-100">
              {form.title}
            </p>
          )}
          {/* Heading */}
          {form.heading && (
            <p className="truncate text-xs text-slate-300">{form.heading}</p>
          )}
          {/* Message */}
          {form.message && (
            <p className="line-clamp-3 text-xs text-slate-400">{form.message}</p>
          )}
          {/* Link */}
          {form.link && (
            <p className="truncate text-xs text-blue-400 underline">
              {form.link}
            </p>
          )}
          {/* Timestamp */}
          <p className="text-[10px] text-slate-600">Just now</p>
        </div>

        {/* Image thumbnail */}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="h-12 w-12 flex-shrink-0 rounded border border-slate-700 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
}

export function UserCommunicationPage() {
  const addToast = useToastStore((s) => s.addToast);

  const [notifications, setNotifications] = useState<ShazacinUserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<NotificationForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Expiry date picker — defaults to 7 days from now (matching TTL 604800)
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate);

  // User search state
  const [userSearch, setUserSearch] = useState("");
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch users when modal opens
  useEffect(() => {
    if (showCreateModal && allUsers.length === 0) {
      const fetchUsers = async () => {
        setUsersLoading(true);
        try {
          const res = await graphqlQuery<{ listAdminUsers: AdminUsersResponse }>(
            listAdminUsers,
            { poolId: POOL_ID }
          );
          setAllUsers(res.listAdminUsers.data ?? []);
        } catch {
          // Silently fail — user search is best-effort
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [showCreateModal, allUsers.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtered users based on search — show all matches with scroll, no arbitrary cap
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers
      .filter((u) => u.email?.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q));
  }, [userSearch, allUsers]);

  const handleUserSearchChange = (value: string) => {
    setUserSearch(value);
    setHighlightedIndex(-1);
    if (value.trim() === "" || form.userId) {
      // Reset selection if user clears search
      if (value.trim() === "") {
        setForm((f) => ({ ...f, userId: "" }));
        setSelectedUserEmail(null);
      }
      setShowDropdown(true);
      return;
    }
    setShowDropdown(true);
  };

  const handleSelectUser = (user: AdminUser) => {
    setForm((f) => ({ ...f, userId: user.userId }));
    setSelectedUserEmail(user.email ?? user.userId);
    setUserSearch(user.email ?? user.userId);
    setShowDropdown(false);
  };

  const handleClearUser = () => {
    setForm((f) => ({ ...f, userId: "" }));
    setSelectedUserEmail(null);
    setUserSearch("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || form.userId) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredUsers.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredUsers.length) {
        const user = filteredUsers[highlightedIndex];
        if (user) handleSelectUser(user);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const fetchNotifications = useCallback(async (token?: string | null) => {
    try {
      setError(null);
      if (!token) setLoading(true);
      const res = await graphqlQuery<{
        listShazacinUserNotifications: ListResponse<ShazacinUserNotification>;
      }>(listShazacinUserNotifications, {
        limit: PAGE_SIZE,
        nextToken: token || undefined,
      });
      const data = res.listShazacinUserNotifications;
      if (token) {
        setNotifications((prev) => [...prev, ...(data.items ?? [])]);
      } else {
        setNotifications(data.items ?? []);
      }
      setNextToken(data.nextToken ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      addToast({ type: "error", message: "Title is required" });
      return;
    }
    setSubmitting(true);
    try {
      const currentUser = await getCurrentUser();
      const adminId = currentUser.userId;

      const input: Record<string, unknown> = {
        title: form.title.trim(),
        heading: form.heading.trim() || undefined,
        message: form.message.trim() || undefined,
        color: form.color,
        icon: form.icon.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        link: form.link.trim() || undefined,
        sendPush: form.sendPush,
        TTL: expiryDate ? Math.max(0, Math.floor((new Date(expiryDate).getTime() - Date.now()) / 1000)) : undefined,
        adminId,
      };
      if (form.userId.trim()) {
        input.userId = form.userId.trim();
      }
      await graphqlMutation(createShazacinUserNotifications, { input });
      addToast({ type: "success", message: "Notification created successfully" });
      setShowCreateModal(false);
      setForm(emptyForm);
      setExpiryDate(getDefaultExpiryDate());
      setUserSearch("");
      setSelectedUserEmail(null);
      fetchNotifications();
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create notification",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await graphqlMutation(deleteShazacinUserNotifications, {
        input: { notificationId: deleteTarget.notificationId },
      });
      addToast({ type: "success", message: "Notification deleted" });
      setDeleteTarget(null);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== deleteTarget.notificationId)
      );
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete notification",
      });
    }
  };

  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  const sortedNotifications = useMemo(() => {
    const sorted = [...notifications];
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
  }, [notifications, sortKey, sortDirection]);

  const columns: import("@/components/ui/DataTable").Column[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "heading",
      label: "Heading",
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row: any) => formatDate(row.createdAt),
    },
    {
      key: "userId",
      label: "User ID",
      hideOnMobile: true,
      render: (row: Record<string, unknown>) => String(row.userId ?? "") || "(broadcast)",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Record<string, unknown>) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-300 focus:ring-2 focus:ring-slate-500 focus:outline-none"
          aria-label={`Delete notification ${row.title ?? row.notificationId}`}
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            User Communication
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Send and manage push notifications to app users.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none"
        >
          <Plus size={16} />
          New Notification
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sortedNotifications as unknown as Record<string, unknown>[]}
        loading={loading}
        error={error}
        onRetry={() => fetchNotifications()}
        emptyMessage="No notifications found."
        nextToken={nextToken}
        onLoadMore={() => fetchNotifications(nextToken)}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!submitting) {
            setShowCreateModal(false);
            setForm(emptyForm);
            setExpiryDate(getDefaultExpiryDate());
            setUserSearch("");
            setSelectedUserEmail(null);
          }
        }}
        title="New Notification"
        className="max-w-4xl"
        footer={
          <>
            <button
              onClick={() => {
                setShowCreateModal(false);
                setForm(emptyForm);
                setExpiryDate(getDefaultExpiryDate());
                setUserSearch("");
                setSelectedUserEmail(null);
              }}
              disabled={submitting}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Notification"}
            </button>
          </>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
          <TextInput
            label="Title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Notification title"
          />
          <TextInput
            label="Heading"
            value={form.heading}
            onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
            placeholder="Notification heading"
          />
          <TextArea
            label="Message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Notification message"
          />

          {/* Live Preview — embedded in form flow */}
          <NotificationPreview form={form} />

          {/* Color Chip Group */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {notificationColors.map((c) => {
                const isSelected = form.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors focus:ring-2 focus:ring-slate-500 focus:outline-none ${
                      isSelected
                        ? "border-slate-500 bg-slate-700 text-slate-100"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                    style={isSelected ? { boxShadow: `0 0 0 2px var(--tw-ring-offset-color, #0f172a), 0 0 0 4px ${colorDotMap[c] ?? colorDotMap.blue}` } : undefined}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: colorDotMap[c] ?? colorDotMap.blue }}
                    />
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Chip Group */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {notificationIcons.map((iconName) => {
                const IconComponent = getNotificationIcon(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                    title={iconName}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors focus:ring-2 focus:ring-slate-500 focus:outline-none ${
                      form.icon === iconName
                        ? "border-slate-500 bg-slate-700 text-slate-100"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {IconComponent ? <IconComponent size={14} /> : null}
                    {iconName}
                  </button>
                );
              })}
            </div>
          </div>

          <TextInput
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
          <TextInput
            label="Link"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            placeholder="https://..."
          />

          {/* User search dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              User ID (leave empty for broadcast to all)
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={showDropdown && !form.userId}
                    aria-controls="user-search-listbox"
                    aria-autocomplete="list"
                    aria-label="Search for a user by email to select their User ID"
                    aria-activedescendant={highlightedIndex >= 0 && filteredUsers[highlightedIndex]
                      ? `user-option-${filteredUsers[highlightedIndex].userId.slice(0, 8)}`
                      : undefined}
                    value={userSearch}
                    onChange={(e) => handleUserSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search by email to select a user..."
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  />
                  {usersLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                    </div>
                  )}
                </div>
                {form.userId && (
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    aria-label="Clear user selection"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {selectedUserEmail && form.userId && (
                <p className="mt-1 text-xs text-slate-400">
                  User: <span className="text-slate-200">{selectedUserEmail}</span>
                </p>
              )}
              {showDropdown && !form.userId && (
                <div role="listbox" id="user-search-listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                  {filteredUsers.length === 0 && !usersLoading && (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      {userSearch.trim() ? "No users found" : "Type to search users..."}
                    </div>
                  )}
                  {filteredUsers.map((user, index) => (
                    <button
                      key={user.userId}
                      id={`user-option-${user.userId.slice(0, 8)}`}
                      role="option"
                      aria-selected={highlightedIndex === index}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none ${highlightedIndex === index ? "bg-slate-700 text-slate-100" : ""}`}
                    >
                      <span className="truncate text-slate-200">{user.email ?? user.userId}</span>
                      <span className="ml-auto flex-shrink-0 text-xs text-slate-500">
                        {user.userId.slice(0, 8)}...
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiry Date — computes TTL in seconds automatically */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none [color-scheme:dark]"
            />
            {expiryDate && (
              <p className="mt-1 text-xs text-slate-500">
                {(() => {
                  const seconds = Math.max(0, Math.floor((new Date(expiryDate).getTime() - Date.now()) / 1000));
                  if (seconds <= 0) return "⚠ Already in the past — notification will expire immediately";
                  const days = Math.floor(seconds / 86400);
                  const hours = Math.floor((seconds % 86400) / 3600);
                  const mins = Math.floor((seconds % 3600) / 60);
                  const parts: string[] = [];
                  if (days) parts.push(`${days}d`);
                  if (hours) parts.push(`${hours}h`);
                  if (mins) parts.push(`${mins}m`);
                  return `Expires in ${parts.join(" ")} (${seconds.toLocaleString()} seconds)`;
                })()}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.sendPush}
              onChange={(e) => setForm((f) => ({ ...f, sendPush: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            />
            Send push notification
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Notification"
        message={`Are you sure you want to delete the notification "${deleteTarget?.title ?? "Untitled"}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
      />
    </div>
  );
}