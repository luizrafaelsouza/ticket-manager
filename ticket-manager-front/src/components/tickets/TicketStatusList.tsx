import type { TicketListItem } from "../../types/ticket";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface TicketStatusListProps {
  tickets: TicketListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function TicketStatusList({ tickets, selectedId, onSelect }: TicketStatusListProps) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Title</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Priority</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onSelect(ticket.id)}
              className={`cursor-pointer ${
                ticket.id === selectedId ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <td className="px-3 py-2 text-slate-900">{ticket.title}</td>
              <td className="px-3 py-2">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-3 py-2 text-slate-500">{formatDate(ticket.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
