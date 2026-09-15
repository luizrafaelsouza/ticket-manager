import { useState } from "react";
import { TicketFilters } from "../components/tickets/TicketFilters";
import { TicketStatusList } from "../components/tickets/TicketStatusList";
import { StatusHistoryTimeline } from "../components/tickets/StatusHistoryTimeline";
import { StatusUpdateControl } from "../components/tickets/StatusUpdateControl";
import { PriorityBadge } from "../components/tickets/PriorityBadge";
import { StatusBadge } from "../components/tickets/StatusBadge";
import { useTicket, useTicketList, useUpdateTicketStatus } from "../hooks/useTickets";
import { useAuth } from "../auth/useAuth";
import { CATEGORY_LABELS, DEFAULT_TICKET_FILTERS } from "../types/ticket";
import type { TicketListFilters, TicketStatus } from "../types/ticket";

interface TicketStatusPageProps {
  onBack: () => void;
}

// This screen shows fewer items per page than the general listing (TicketListPage,
// which uses PAGE_SIZE=10) — explicit request to fit better on screen alongside
// the detail panel.
const STATUS_PAGE_SIZE = 8;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function TicketStatusPage({ onBack }: TicketStatusPageProps) {
  const [filters, setFilters] = useState<TicketListFilters>({
    ...DEFAULT_TICKET_FILTERS,
    pageSize: STATUS_PAGE_SIZE,
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { user } = useAuth();

  const { tickets, total, isLoading, error, refetch } = useTicketList(filters);
  const totalPages = Math.max(1, Math.ceil(total / STATUS_PAGE_SIZE));
  const {
    ticket,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useTicket(selectedTicketId);
  const updateStatus = useUpdateTicketStatus();

  function handleRefresh() {
    refetch();
    refetchDetail();
  }

  function handleAdvance(nextStatus: TicketStatus) {
    if (!selectedTicketId) return;
    updateStatus.mutate(selectedTicketId, nextStatus, {
      onSuccess: () => {
        refetchDetail();
        refetch();
      },
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">View / Update Status</h1>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh list"
            title="Refresh list"
            className="flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
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
        <div className="flex flex-col gap-4">
          <div>
            <TicketStatusList
              tickets={tickets}
              selectedId={selectedTicketId}
              onSelect={setSelectedTicketId}
            />
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
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
          </div>

          <div className="rounded border border-slate-200 p-5">
            {!selectedTicketId && (
              <p className="text-sm text-slate-500">Select a ticket from the table above.</p>
            )}

            {selectedTicketId && isDetailLoading && (
              <p className="text-slate-600">Loading ticket...</p>
            )}

            {selectedTicketId && !isDetailLoading && detailError && (
              <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">
                Unable to load this ticket. Please try again later.
              </p>
            )}

            {selectedTicketId && !isDetailLoading && !detailError && ticket && (
              <>
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">{ticket.title}</h2>
                  <StatusBadge status={ticket.status} />
                </div>

                <p className="mb-3 text-sm text-slate-600">{ticket.description}</p>

                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {CATEGORY_LABELS[ticket.category]}
                  </span>
                  <PriorityBadge priority={ticket.priority} />
                </div>

                <p className="mb-5 text-sm text-slate-500">
                  Created by: {ticket.created_by_name} — {formatDate(ticket.created_at)}
                </p>

                <div className="mb-5 border-t border-slate-200 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Status history
                  </h3>
                  <StatusHistoryTimeline history={ticket.history} />
                </div>

                {updateStatus.error && (
                  <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-800">
                    {updateStatus.error}
                  </p>
                )}

                <StatusUpdateControl
                  status={ticket.status}
                  isSupport={user?.role === "SUPPORT"}
                  isPending={updateStatus.isPending}
                  onAdvance={handleAdvance}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
