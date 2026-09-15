import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("shows the correct label and color for each status", () => {
    const { rerender } = render(<StatusBadge status="OPEN" />);
    expect(screen.getByText("Open")).toHaveClass("bg-blue-50", "text-blue-700");

    rerender(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In Progress")).toHaveClass("bg-amber-50", "text-amber-700");

    rerender(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText("Resolved")).toHaveClass("bg-green-50", "text-green-700");

    rerender(<StatusBadge status="CLOSED" />);
    expect(screen.getByText("Closed")).toHaveClass("bg-slate-100", "text-slate-500");
  });
});
