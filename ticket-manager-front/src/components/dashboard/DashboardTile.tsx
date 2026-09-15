interface DashboardTileProps {
  label: string;
  onClick: () => void;
}

export function DashboardTile({ label, onClick }: DashboardTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-slate-300 bg-white p-4 text-center text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50"
    >
      {label}
    </button>
  );
}
