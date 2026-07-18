import { Link, useMatches } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useMemo } from "react";

interface RouteHandle {
  crumb?: string;
}

export function Breadcrumbs() {
  const matches = useMatches();

  const crumbs = useMemo(() => {
    return matches
      .filter((m) => {
        const handle = m.handle as RouteHandle | undefined;
        return handle?.crumb;
      })
      .map((m) => {
        const handle = m.handle as RouteHandle;
        return {
          path: m.pathname,
          label: handle.crumb!,
        };
      });
  }, [matches]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      className="mb-4 flex items-center gap-1.5 text-sm text-slate-400"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
      >
        <Home size={14} />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-slate-600" />
          {i === crumbs.length - 1 ? (
            <span className="text-slate-200">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="rounded px-1 py-0.5 transition-colors hover:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
