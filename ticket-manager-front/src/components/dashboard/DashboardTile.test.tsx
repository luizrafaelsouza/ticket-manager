import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardTile } from "./DashboardTile";

describe("DashboardTile", () => {
  it("shows the label and calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<DashboardTile label="Criar ticket" onClick={onClick} />);

    expect(screen.getByText("Criar ticket")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Criar ticket" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
