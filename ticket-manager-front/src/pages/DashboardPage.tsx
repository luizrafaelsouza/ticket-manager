import { DashboardTile } from "../components/dashboard/DashboardTile";

type NavigableView = "new-ticket" | "list" | "status";

interface DashboardPageProps {
  onNavigate: (view: NavigableView) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <DashboardTile label="Create ticket" onClick={() => onNavigate("new-ticket")} />
        <DashboardTile label="List tickets" onClick={() => onNavigate("list")} />
        <DashboardTile
          label="View / Update Status"
          onClick={() => onNavigate("status")}
        />
      </div>
    </div>
  );
}
