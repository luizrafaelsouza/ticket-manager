import { useState } from "react";
import { TicketTable } from "../components/tickets/TicketTable";
import { TicketFilters } from "../components/tickets/TicketFilters";
import { useTicketList } from "../hooks/useTickets";
import { DEFAULT_TICKET_FILTERS, PAGE_SIZE } from "../types/ticket";

interface TicketListPageProps {
  onBack: () => void;
}

export function TicketListPage({ onBack }: TicketListPageProps) {
  const [filters, setFilters] = useState(DEFAULT_TICKET_FILTERS);
  const { tickets, total, isLoading, error, refetch } = useTicketList(filters);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">Tickets</h1>
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            aria-label="Refresh list"
            title="Refresh list"
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Update
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </button>
      </div>

      <TicketFilters value={filters} onChange={setFilters} />

      {isLoading && <p className="text-slate-600">Loading tickets...</p>}

      {!isLoading && error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">
          Unable to load tickets. Please try again later.
        </p>
      )}

      {!isLoading && !error && tickets.length === 0 && (
        <p className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-600">
          There are no tickets to display.
        </p>
      )}

      {!isLoading && !error && tickets.length > 0 && (
        <>
          <TicketTable tickets={tickets} />
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page <= 1}
              aria-label="Previous page"
              title="Previous page"
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              &lt;&lt;
            </button>
            <span>
              Page {filters.page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= totalPages}
              aria-label="Next page"
              title="Next page"
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50 disabled:opacity-50"
            >
              &gt;&gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
}
