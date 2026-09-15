import { useCallback, useEffect, useState } from "react";
import { createTicket, getTicket, listTickets, updateTicketStatus } from "../api/tickets";
import { ApiError } from "../api/client";
import type {
  Ticket,
  TicketCreatePayload,
  TicketDetail,
  TicketListFilters,
  TicketListItem,
  TicketStatus,
} from "../types/ticket";

interface CreateTicketState {
  isPending: boolean;
  error: string | null;
}

export function useCreateTicket() {
  const [state, setState] = useState<CreateTicketState>({ isPending: false, error: null });

  async function mutate(
    payload: TicketCreatePayload,
    options?: { onSuccess?: (ticket: Ticket) => void },
  ) {
    setState({ isPending: true, error: null });
    try {
      const ticket = await createTicket(payload);
      setState({ isPending: false, error: null });
      options?.onSuccess?.(ticket);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong, please try again.";
      setState({ isPending: false, error: message });
    }
  }

  return { ...state, mutate };
}

interface TicketListState {
  tickets: TicketListItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export function useTicketList(filters: TicketListFilters) {
  const [state, setState] = useState<TicketListState>({
    tickets: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await listTickets(filters);
      setState({ tickets: data.items ?? [], total: data.total ?? 0, isLoading: false, error: null });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong, please try again.";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, [
    filters.status,
    filters.category,
    filters.priority,
    filters.sortBy,
    filters.sortDir,
    filters.page,
    filters.pageSize,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

interface TicketDetailState {
  ticket: TicketDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useTicket(id: string | null) {
  const [state, setState] = useState<TicketDetailState>({
    ticket: null,
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!id) {
      setState({ ticket: null, isLoading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const ticket = await getTicket(id);
      setState({ ticket, isLoading: false, error: null });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong, please try again.";
      setState({ ticket: null, isLoading: false, error: message });
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

interface UpdateTicketStatusState {
  isPending: boolean;
  error: string | null;
}

export function useUpdateTicketStatus() {
  const [state, setState] = useState<UpdateTicketStatusState>({ isPending: false, error: null });

  async function mutate(
    id: string,
    status: TicketStatus,
    options?: { onSuccess?: (ticket: TicketDetail) => void },
  ) {
    setState({ isPending: true, error: null });
    try {
      const ticket = await updateTicketStatus(id, status);
      setState({ isPending: false, error: null });
      options?.onSuccess?.(ticket);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong, please try again.";
      setState({ isPending: false, error: message });
    }
  }

  return { ...state, mutate };
}
