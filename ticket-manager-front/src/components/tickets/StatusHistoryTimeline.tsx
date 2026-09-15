import { STATUS_LABELS } from "../../types/ticket";
import type { StatusHistoryItem } from "../../types/ticket";

interface StatusHistoryTimelineProps {
  history: StatusHistoryItem[];
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  return (
    <div>
      {history.map((item, index) => (
        <div key={`${item.to_status}-${item.changed_at}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            {index < history.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-slate-900">
              {item.from_status
                ? `${STATUS_LABELS[item.from_status]} → ${STATUS_LABELS[item.to_status]}`
                : `Ticket created — ${STATUS_LABELS[item.to_status]}`}
            </p>
            <p className="text-xs text-slate-500">
              by {item.changed_by_name} — {formatDateTime(item.changed_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
