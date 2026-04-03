import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";

describe("Home", () => {
  it("shows empty state when there are no todos", () => {
    render(<Home />);

    expect(screen.getByText("할 일이 없습니다.")).toBeInTheDocument();
  });

  it("adds a new todo and clears the input", async () => {
    render(<Home />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText("할 일을 입력하세요");
    const addButton = screen.getByRole("button", { name: "추가" });

    await user.type(input, "공부하기");
    await user.click(addButton);

    expect(screen.getByText("공부하기")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("toggles a todo done state when checkbox is clicked", async () => {
    render(<Home />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText("할 일을 입력하세요");
    const addButton = screen.getByRole("button", { name: "추가" });

    await user.type(input, "문제 풀기");
    await user.click(addButton);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText("문제 풀기")).toHaveClass("line-through");
  });

  it("deletes a todo when the 삭제 button is clicked", async () => {
    render(<Home />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText("할 일을 입력하세요");
    const addButton = screen.getByRole("button", { name: "추가" });

    await user.type(input, "리액트 공부");
    await user.click(addButton);

    const deleteButton = screen.getByRole("button", { name: "삭제" });
    await user.click(deleteButton);

    expect(screen.queryByText("리액트 공부")).not.toBeInTheDocument();
    expect(screen.getByText("할 일이 없습니다.")).toBeInTheDocument();
  });
});
