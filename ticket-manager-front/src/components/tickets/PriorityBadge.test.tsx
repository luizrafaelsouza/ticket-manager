import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "./PriorityBadge";

describe("PriorityBadge", () => {
  it("shows the correct label and color for each priority", () => {
    const { rerender } = render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText("Low")).toHaveClass("bg-slate-100", "text-slate-600");

    rerender(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText("Medium")).toHaveClass("bg-blue-50", "text-blue-700");

    rerender(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText("High")).toHaveClass("bg-orange-50", "text-orange-700");

    rerender(<PriorityBadge priority="URGENT" />);
    expect(screen.getByText("Urgent")).toHaveClass("bg-red-50", "text-red-700");
  });
});
