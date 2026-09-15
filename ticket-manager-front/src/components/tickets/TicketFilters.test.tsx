import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketFilters } from "./TicketFilters";
import { DEFAULT_TICKET_FILTERS } from "../../types/ticket";

describe("TicketFilters", () => {
  it("calls onChange with the chosen status, resetting the page", async () => {
    const onChange = vi.fn();
    render(<TicketFilters value={DEFAULT_TICKET_FILTERS} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText(/filter by status/i), "OPEN");

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_TICKET_FILTERS,
      status: "OPEN",
      page: 1,
    });
  });

  it("calls onChange with the correct sortBy/sortDir when changing the sort order", async () => {
    const onChange = vi.fn();
    render(<TicketFilters value={DEFAULT_TICKET_FILTERS} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText(/sort by/i), "priority-asc");

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_TICKET_FILTERS,
      sortBy: "priority",
      sortDir: "asc",
      page: 1,
    });
  });
});
