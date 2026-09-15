import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketForm } from "./TicketForm";

describe("TicketForm", () => {
  it("blocks submission when required fields are empty", async () => {
    const onSubmit = vi.fn();
    render(<TicketForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(await screen.findByText(/enter a title/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the correct payload when the form is valid", async () => {
    const onSubmit = vi.fn();
    render(<TicketForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/title/i), "Impressora não funciona");
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "A impressora do 3º andar não liga.",
    );
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "IT");
    await userEvent.selectOptions(screen.getByLabelText(/priority/i), "HIGH");
    await userEvent.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Impressora não funciona",
      description: "A impressora do 3º andar não liga.",
      category: "IT",
      priority: "HIGH",
    });
  });

  it("disables the submit button when 'disabled' is active", () => {
    render(<TicketForm onSubmit={vi.fn()} disabled />);

    expect(screen.getByRole("button", { name: /submit ticket/i })).toBeDisabled();
  });
});
