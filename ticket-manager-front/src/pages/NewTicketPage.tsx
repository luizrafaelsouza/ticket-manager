import { TicketForm } from "../components/tickets/TicketForm";
import { useCreateTicket } from "../hooks/useTickets";
import type { TicketCreatePayload } from "../types/ticket";

interface NewTicketPageProps {
  onDone: () => void;
  onBack: () => void;
}

export function NewTicketPage({ onDone, onBack }: NewTicketPageProps) {
  const createTicket = useCreateTicket();

  function handleSubmit(values: TicketCreatePayload) {
    createTicket.mutate(values, { onSuccess: onDone });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-slate-900">New ticket</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </button>
      </div>

      <TicketForm
        onSubmit={handleSubmit}
        isSubmitting={createTicket.isPending}
        submitError={createTicket.error}
      />
    </div>
  );
}
