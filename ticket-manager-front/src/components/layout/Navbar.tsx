import { useAuth } from "../../auth/useAuth";
import type { Role } from "../../types/user";

const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Employee",
  SUPPORT: "Support",
};

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <span className="text-lg font-semibold text-slate-900">Ticket Manager</span>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          {user && (
            <span>
              {user.name} — {ROLE_LABELS[user.role]}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
