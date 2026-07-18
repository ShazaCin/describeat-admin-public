import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Film,
  MessageSquare,
  Bell,
  Users,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { graphqlQuery } from "@/services/amplifyClient";
import { listShazacinMetadataTitles, listShazacinUserNotifications, listShazacinUserFeedbacks, listAdminUsers } from "@/graphql/queries";
import type {
  ShazacinMetadataTitle,
  ShazacinUserNotification,
  ShazacinUserFeedback,
  AdminUsersResponse,
  ListResponse,
} from "@/types/graphql";
import { useToastStore } from "@/stores/toastStore";

const POOL_ID = "USER";

const cardConfig = [
  {
    key: "titles",
    label: "Total Titles",
    icon: Film,
    color: "text-blue-400",
    bg: "bg-blue-950/40 border-blue-800",
    link: "/titleManagement",
  },
  {
    key: "feedback",
    label: "Recent Feedback",
    icon: MessageSquare,
    color: "text-green-400",
    bg: "bg-green-950/40 border-green-800",
    link: "/UsersFeedback",
  },
  {
    key: "notifications",
    label: "Recent Notifications",
    icon: Bell,
    color: "text-yellow-400",
    bg: "bg-yellow-950/40 border-yellow-800",
    link: "/UserCommunication",
  },
  {
    key: "users",
    label: "Active Users",
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-950/40 border-purple-800",
    link: "/UsersOverview",
  },
];

interface Counts {
  titles: number;
  feedback: number;
  notifications: number;
  users: number;
}

export function DashboardPage() {
  const [counts, setCounts] = useState<Counts>({
    titles: 0,
    feedback: 0,
    notifications: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      try {
        const LIMIT = 200;
        const [titlesRes, feedbackRes, notifRes, usersRes] = await Promise.all([
          graphqlQuery<{ listShazacinMetadataTitles: ListResponse<ShazacinMetadataTitle> }>(
            listShazacinMetadataTitles,
            { limit: LIMIT }
          ),
          graphqlQuery<{ listShazacinUserFeedbacks: ListResponse<ShazacinUserFeedback> }>(
            listShazacinUserFeedbacks,
            { limit: LIMIT }
          ),
          graphqlQuery<{ listShazacinUserNotifications: ListResponse<ShazacinUserNotification> }>(
            listShazacinUserNotifications,
            { limit: LIMIT }
          ),
          graphqlQuery<{ listAdminUsers: AdminUsersResponse }>(
            listAdminUsers,
            { poolId: POOL_ID }
          ),
        ]);

        if (cancelled) return;

        setCounts({
          titles: titlesRes?.listShazacinMetadataTitles?.items?.length ?? 0,
          feedback: feedbackRes?.listShazacinUserFeedbacks?.items?.length ?? 0,
          notifications: notifRes?.listShazacinUserNotifications?.items?.length ?? 0,
          users: usersRes?.listAdminUsers?.totalUsers ?? 0,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard data";
        if (!cancelled) {
          setError(message);
          addToast({ type: "error", message: `Dashboard error: ${message}` });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCounts();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const values: Record<keyof Counts, number> = counts;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your Shazacin content and user activity.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.key}
              to={card.link}
              className={`group flex items-start gap-4 rounded-xl border p-5 transition-colors hover:border-slate-600 ${card.bg}`}
            >
              <div className={`rounded-lg bg-slate-900 p-2.5 ${card.color}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="h-8 w-12 animate-pulse rounded bg-slate-800" />
                ) : (
                  <p className="text-2xl font-bold text-slate-100">
                    {values[card.key as keyof Counts] === 0 ? "—" : values[card.key as keyof Counts]}
                  </p>
                )}
                <p className="text-sm text-slate-400">{card.label}</p>
              </div>
              <ArrowRight
                size={16}
                className="mt-1 shrink-0 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}