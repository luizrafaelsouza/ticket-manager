import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("renders the 'Create ticket' tile and navigates on click", async () => {
    const onNavigate = vi.fn();
    render(<DashboardPage onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(onNavigate).toHaveBeenCalledWith("new-ticket");
  });

  it("renders the 'List tickets' tile and navigates on click", async () => {
    const onNavigate = vi.fn();
    render(<DashboardPage onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole("button", { name: "List tickets" }));

    expect(onNavigate).toHaveBeenCalledWith("list");
  });

  it("renders the 'View / Update Status' tile and navigates on click", async () => {
    const onNavigate = vi.fn();
    render(<DashboardPage onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole("button", { name: "View / Update Status" }));

    expect(onNavigate).toHaveBeenCalledWith("status");
  });
});
