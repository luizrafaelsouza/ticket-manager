import { ALLOWED_NEXT_STATUS, STATUS_LABELS } from "../../types/ticket";
import type { TicketStatus } from "../../types/ticket";

interface StatusUpdateControlProps {
  status: TicketStatus;
  isSupport: boolean;
  isPending?: boolean;
  onAdvance: (nextStatus: TicketStatus) => void;
}

export function StatusUpdateControl({
  status,
  isSupport,
  isPending,
  onAdvance,
}: StatusUpdateControlProps) {
  if (!isSupport) {
    return null;
  }

  const nextStatus = ALLOWED_NEXT_STATUS[status];

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-xs text-slate-500">Current status</p>
        <p className="text-sm font-semibold text-slate-900">{STATUS_LABELS[status]}</p>
      </div>
      {nextStatus && (
        <button
          type="button"
          onClick={() => onAdvance(nextStatus)}
          disabled={isPending}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Updating..." : `Advance to: ${STATUS_LABELS[nextStatus]}`}
        </button>
      )}
    </div>
  );
}
