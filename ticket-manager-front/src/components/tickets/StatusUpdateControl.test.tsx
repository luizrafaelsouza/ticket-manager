import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusUpdateControl } from "./StatusUpdateControl";

describe("StatusUpdateControl", () => {
  it("renders nothing for non-support users", () => {
    const { container } = render(
      <StatusUpdateControl status="OPEN" isSupport={false} onAdvance={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the button with the correct next status and calls onAdvance on click", async () => {
    const onAdvance = vi.fn();
    render(<StatusUpdateControl status="OPEN" isSupport onAdvance={onAdvance} />);

    const button = screen.getByRole("button", { name: /advance to: in progress/i });
    await userEvent.click(button);

    expect(onAdvance).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("does not show the advance button when the ticket is already closed", () => {
    render(<StatusUpdateControl status="CLOSED" isSupport onAdvance={vi.fn()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disables the button while the update is pending", () => {
    render(<StatusUpdateControl status="OPEN" isSupport isPending onAdvance={vi.fn()} />);

    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  });
});
