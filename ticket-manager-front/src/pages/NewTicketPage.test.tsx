import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTicketPage } from "./NewTicketPage";
import { createTicket } from "../api/tickets";
import type { Ticket } from "../types/ticket";

vi.mock("../api/tickets", () => ({
  createTicket: vi.fn(),
}));

function fakeTicket(): Ticket {
  return {
    id: "1",
    title: "Impressora não funciona",
    description: "A impressora não liga.",
    category: "IT",
    priority: "HIGH",
    status: "OPEN",
    created_by_id: "ana-employee",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  };
}

describe("NewTicketPage", () => {
  it("submits the ticket and calls onDone when creation succeeds", async () => {
    vi.mocked(createTicket).mockResolvedValue(fakeTicket());
    const onDone = vi.fn();

    render(<NewTicketPage onDone={onDone} onBack={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/title/i), "Impressora não funciona");
    await userEvent.type(screen.getByLabelText(/description/i), "A impressora não liga.");
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "IT");
    await userEvent.selectOptions(screen.getByLabelText(/priority/i), "HIGH");
    await userEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(createTicket).toHaveBeenCalledWith({
      title: "Impressora não funciona",
      description: "A impressora não liga.",
      category: "IT",
      priority: "HIGH",
    });
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
  });

  it("shows a generic error message when creation fails", async () => {
    vi.mocked(createTicket).mockRejectedValue(new Error("Network error"));

    render(<NewTicketPage onDone={vi.fn()} onBack={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/title/i), "X");
    await userEvent.type(screen.getByLabelText(/description/i), "Y");
    await userEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(await screen.findByText(/something went wrong, please try again/i)).toBeInTheDocument();
  });

  it("the 'Back to dashboard' button calls onBack", async () => {
    const onBack = vi.fn();
    render(<NewTicketPage onDone={vi.fn()} onBack={onBack} />);

    await userEvent.click(screen.getByRole("button", { name: /back to dashboard/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
