export type Category = "IT" | "FACILITIES" | "HR";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export const CATEGORY_LABELS: Record<Category, string> = {
  IT: "IT",
  FACILITIES: "Facilities",
  HR: "HR",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export interface TicketCreatePayload {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface TicketListItem {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export type SortBy = "created_at" | "priority";
export type SortDir = "asc" | "desc";

export interface TicketListFilters {
  status?: TicketStatus;
  category?: Category;
  priority?: Priority;
  sortBy: SortBy;
  sortDir: SortDir;
  page: number;
  // Opcional: por padrão usa PAGE_SIZE. A tela "Consultar / Atualizar Status"
  // sobrescreve com um valor menor (ver STATUS_PAGE_SIZE em TicketStatusPage.tsx).
  pageSize?: number;
}

export const DEFAULT_TICKET_FILTERS: TicketListFilters = {
  sortBy: "created_at",
  sortDir: "desc",
  page: 1,
};

export const PAGE_SIZE = 10;

export interface PaginatedTickets {
  items: TicketListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface StatusHistoryItem {
  from_status: TicketStatus | null;
  to_status: TicketStatus;
  changed_by_name: string;
  changed_at: string;
}

export interface TicketDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: TicketStatus;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  history: StatusHistoryItem[];
}

// Espelha o mapa de transição sequencial do backend (ticket_service.ALLOWED_TRANSITIONS) —
// usado só pra saber qual é o próximo status a oferecer no botão, sem esperar a API responder.
export const ALLOWED_NEXT_STATUS: Record<TicketStatus, TicketStatus | null> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "RESOLVED",
  RESOLVED: "CLOSED",
  CLOSED: null,
};
