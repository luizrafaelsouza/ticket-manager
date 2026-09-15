import { apiClient } from "./client";
import { PAGE_SIZE } from "../types/ticket";
import type {
  PaginatedTickets,
  Ticket,
  TicketCreatePayload,
  TicketDetail,
  TicketListFilters,
  TicketStatus,
} from "../types/ticket";

export function createTicket(payload: TicketCreatePayload): Promise<Ticket> {
  return apiClient.post<Ticket>("/api/tickets", payload);
}

export function getTicket(id: string): Promise<TicketDetail> {
  return apiClient.get<TicketDetail>(`/api/tickets/${id}`);
}

export function updateTicketStatus(id: string, status: TicketStatus): Promise<TicketDetail> {
  return apiClient.patch<TicketDetail>(`/api/tickets/${id}/status`, { status });
}

function buildQueryString(filters: TicketListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.priority) params.set("priority", filters.priority);
  params.set("sort_by", filters.sortBy);
  params.set("sort_dir", filters.sortDir);
  params.set("page", String(filters.page));
  params.set("page_size", String(filters.pageSize ?? PAGE_SIZE));
  return params.toString();
}

export function listTickets(filters: TicketListFilters): Promise<PaginatedTickets> {
  return apiClient.get<PaginatedTickets>(`/api/tickets?${buildQueryString(filters)}`);
}
