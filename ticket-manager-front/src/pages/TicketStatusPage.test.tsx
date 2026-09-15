import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketStatusPage } from "./TicketStatusPage";
import { AuthProvider } from "../auth/AuthContext";
import { setAuthToken } from "../api/client";
import { getCurrentUser } from "../api/auth";
import { getTicket, listTickets, updateTicketStatus } from "../api/tickets";
import type { PaginatedTickets, TicketDetail, TicketListItem } from "../types/ticket";
import type { User } from "../types/user";

vi.mock("../api/tickets", () => ({
  listTickets: vi.fn(),
  getTicket: vi.fn(),
  updateTicketStatus: vi.fn(),
}));

vi.mock("../api/auth", () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const support: User = {
  id: "carlos-support",
  name: "Carlos",
  email: "carlos@ticketmanager.local",
  role: "SUPPORT",
};

const employee: User = {
  id: "ana-employee",
  name: "Ana",
  email: "ana@ticketmanager.local",
  role: "EMPLOYEE",
};

const listItem: TicketListItem = {
  id: "1",
  title: "Impressora quebrada",
  category: "IT",
  priority: "HIGH",
  status: "OPEN",
  created_by_name: "Ana",
  created_at: "2026-01-01T10:00:00Z",
  updated_at: "2026-01-01T10:00:00Z",
};

function onePage(): PaginatedTickets {
  return { items: [listItem], total: 1, page: 1, page_size: 10 };
}

function detail(): TicketDetail {
  return {
    id: "1",
    title: "Impressora quebrada",
    description: "Não liga.",
    category: "IT",
    priority: "HIGH",
    status: "OPEN",
    created_by_name: "Ana",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
    history: [
      { from_status: null, to_status: "OPEN", changed_by_name: "Ana", changed_at: "2026-01-01T10:00:00Z" },
    ],
  };
}

function renderAs(user: User, onBack = vi.fn()) {
  vi.mocked(getCurrentUser).mockResolvedValue(user);
  setAuthToken("fake-token");
  return render(
    <AuthProvider>
      <TicketStatusPage onBack={onBack} />
    </AuthProvider>,
  );
}

function renderAsSupport() {
  return renderAs(support);
}

describe("TicketStatusPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the empty detail state before selecting a ticket", async () => {
    vi.mocked(listTickets).mockResolvedValue(onePage());

    renderAsSupport();

    expect(await screen.findByText(/select a ticket from the table above/i)).toBeInTheDocument();
  });

  it("fetches and shows the detail with history when a ticket is clicked", async () => {
    vi.mocked(listTickets).mockResolvedValue(onePage());
    vi.mocked(getTicket).mockResolvedValue(detail());

    renderAsSupport();
    await userEvent.click(await screen.findByText("Impressora quebrada"));

    expect(await screen.findByText("Não liga.")).toBeInTheDocument();
    expect(screen.getByText(/created by: ana/i)).toBeInTheDocument();
    expect(getTicket).toHaveBeenCalledWith("1");
  });

  it("advancing the status calls the API and reloads the detail", async () => {
    vi.mocked(listTickets).mockResolvedValue(onePage());
    vi.mocked(getTicket).mockResolvedValue(detail());
    vi.mocked(updateTicketStatus).mockResolvedValue({
      ...detail(),
      status: "IN_PROGRESS",
      history: [
        ...detail().history,
        {
          from_status: "OPEN",
          to_status: "IN_PROGRESS",
          changed_by_name: "Carlos",
          changed_at: "2026-01-02T10:00:00Z",
        },
      ],
    });

    renderAsSupport();
    await userEvent.click(await screen.findByText("Impressora quebrada"));
    await screen.findByText("Não liga.");

    await userEvent.click(screen.getByRole("button", { name: /advance to: in progress/i }));

    expect(updateTicketStatus).toHaveBeenCalledWith("1", "IN_PROGRESS");
    expect(getTicket).toHaveBeenCalledTimes(2);
  });

  it("hides the advance-status control for non-support users", async () => {
    vi.mocked(listTickets).mockResolvedValue(onePage());
    vi.mocked(getTicket).mockResolvedValue(detail());

    renderAs(employee);
    await userEvent.click(await screen.findByText("Impressora quebrada"));
    await screen.findByText("Não liga.");

    expect(screen.queryByRole("button", { name: /advance to/i })).not.toBeInTheDocument();
  });

  it("fetches 8 items per page and navigates to the next page on click", async () => {
    vi.mocked(listTickets).mockResolvedValue({ items: [listItem], total: 20, page: 1, page_size: 8 });

    renderAsSupport();
    await screen.findByText("Impressora quebrada");

    expect(listTickets).toHaveBeenLastCalledWith(expect.objectContaining({ pageSize: 8, page: 1 }));
    expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /next page/i }));

    expect(listTickets).toHaveBeenLastCalledWith(expect.objectContaining({ pageSize: 8, page: 2 }));
  });

  it("the 'Back to dashboard' button calls onBack", async () => {
    vi.mocked(listTickets).mockResolvedValue(onePage());
    const onBack = vi.fn();

    renderAs(support, onBack);
    await screen.findByText("Impressora quebrada");

    await userEvent.click(screen.getByRole("button", { name: /back to dashboard/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
