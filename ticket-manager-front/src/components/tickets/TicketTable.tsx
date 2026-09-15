import { CATEGORY_LABELS } from "../../types/ticket";
import type { TicketListItem } from "../../types/ticket";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface TicketTableProps {
  tickets: TicketListItem[];
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

export function TicketTable({ tickets }: TicketTableProps) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Title</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Category</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Priority</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Created by</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Created at</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-3 py-2 text-slate-900">{ticket.title}</td>
              <td className="px-3 py-2 text-slate-600">{CATEGORY_LABELS[ticket.category]}</td>
              <td className="px-3 py-2">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-3 py-2 text-slate-600">{ticket.created_by_name}</td>
              <td className="px-3 py-2 text-slate-600">{formatDate(ticket.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
