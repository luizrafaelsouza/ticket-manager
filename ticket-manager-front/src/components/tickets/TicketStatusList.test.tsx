import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketStatusList } from "./TicketStatusList";
import type { TicketListItem } from "../../types/ticket";

const tickets: TicketListItem[] = [
  {
    id: "1",
    title: "Impressora quebrada",
    category: "IT",
    priority: "HIGH",
    status: "OPEN",
    created_by_name: "Ana",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  },
  {
    id: "2",
    title: "Ar-condicionado com barulho",
    category: "FACILITIES",
    priority: "LOW",
    status: "IN_PROGRESS",
    created_by_name: "Carlos",
    created_at: "2026-01-02T10:00:00Z",
    updated_at: "2026-01-02T10:00:00Z",
  },
];

describe("TicketStatusList", () => {
  it("calls onSelect with the correct id when clicking a row", async () => {
    const onSelect = vi.fn();
    render(<TicketStatusList tickets={tickets} selectedId={null} onSelect={onSelect} />);

    await userEvent.click(screen.getByText("Impressora quebrada"));

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("highlights the selected row", () => {
    render(<TicketStatusList tickets={tickets} selectedId="2" onSelect={vi.fn()} />);

    const selectedRow = screen.getByText("Ar-condicionado com barulho").closest("tr");
    const otherRow = screen.getByText("Impressora quebrada").closest("tr");

    expect(selectedRow).toHaveClass("bg-slate-100");
    expect(otherRow).not.toHaveClass("bg-slate-100");
  });
});
