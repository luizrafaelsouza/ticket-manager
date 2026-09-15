import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketTable } from "./TicketTable";
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

describe("TicketTable", () => {
  it("renders one row per ticket, with translated labels", () => {
    render(<TicketTable tickets={tickets} />);

    expect(screen.getByText("Impressora quebrada")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado com barulho")).toBeInTheDocument();
    expect(screen.getByText("IT")).toBeInTheDocument();
    expect(screen.getByText("Facilities")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
  });

  it("does not break when the list is empty", () => {
    render(<TicketTable tickets={[]} />);

    expect(screen.queryByRole("row", { name: /impressora/i })).not.toBeInTheDocument();
  });
});
