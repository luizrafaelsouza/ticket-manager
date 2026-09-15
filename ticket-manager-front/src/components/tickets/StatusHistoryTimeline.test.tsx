import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusHistoryTimeline } from "./StatusHistoryTimeline";
import type { StatusHistoryItem } from "../../types/ticket";

const history: StatusHistoryItem[] = [
  { from_status: null, to_status: "OPEN", changed_by_name: "Ana", changed_at: "2026-01-01T10:00:00Z" },
  {
    from_status: "OPEN",
    to_status: "IN_PROGRESS",
    changed_by_name: "Carlos",
    changed_at: "2026-01-02T14:30:00Z",
  },
];

describe("StatusHistoryTimeline", () => {
  it("shows the creation entry and subsequent transitions, with who made each change", () => {
    render(<StatusHistoryTimeline history={history} />);

    expect(screen.getByText("Ticket created — Open")).toBeInTheDocument();
    expect(screen.getByText("Open → In Progress")).toBeInTheDocument();
    expect(screen.getByText(/by ana/i)).toBeInTheDocument();
    expect(screen.getByText(/by carlos/i)).toBeInTheDocument();
  });

  it("does not break with empty history", () => {
    const { container } = render(<StatusHistoryTimeline history={[]} />);

    expect(screen.queryByText(/ticket created/i)).not.toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });
});
