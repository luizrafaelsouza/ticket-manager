import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketListPage } from "./TicketListPage";
import { listTickets } from "../api/tickets";
import type { PaginatedTickets } from "../types/ticket";

vi.mock("../api/tickets", () => ({
  listTickets: vi.fn(),
}));

function emptyPage(): PaginatedTickets {
  return { items: [], total: 0, page: 1, page_size: 10 };
}

describe("TicketListPage", () => {
  it("shows the empty state when there are no tickets", async () => {
    vi.mocked(listTickets).mockResolvedValue(emptyPage());

    render(<TicketListPage onBack={vi.fn()} />);

    expect(
      await screen.findByText(/there are no tickets to display/i),
    ).toBeInTheDocument();
  });

  it("shows a generic message when the fetch fails, not the technical error", async () => {
    vi.mocked(listTickets).mockRejectedValue(new Error("Method Not Allowed"));

    render(<TicketListPage onBack={vi.fn()} />);

    expect(
      await screen.findByText(/unable to load tickets\. please try again later\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/method not allowed/i)).not.toBeInTheDocument();
  });

  it("the refresh button fetches the list again", async () => {
    vi.mocked(listTickets).mockResolvedValue(emptyPage());

    render(<TicketListPage onBack={vi.fn()} />);
    await screen.findByText(/there are no tickets to display/i);

    expect(listTickets).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: /refresh list/i }));

    expect(listTickets).toHaveBeenCalledTimes(2);
  });

  it("the 'Back to dashboard' button calls onBack", async () => {
    vi.mocked(listTickets).mockResolvedValue(emptyPage());
    const onBack = vi.fn();

    render(<TicketListPage onBack={onBack} />);
    await screen.findByText(/there are no tickets to display/i);

    await userEvent.click(screen.getByRole("button", { name: /back to dashboard/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("changing a filter fetches the list again, resetting to page 1", async () => {
    vi.mocked(listTickets).mockResolvedValue(emptyPage());

    render(<TicketListPage onBack={vi.fn()} />);
    await screen.findByText(/there are no tickets to display/i);

    expect(listTickets).toHaveBeenCalledTimes(1);

    await userEvent.selectOptions(screen.getByLabelText(/filter by status/i), "OPEN");

    expect(listTickets).toHaveBeenCalledTimes(2);
    expect(listTickets).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "OPEN", page: 1 }),
    );
  });
});
