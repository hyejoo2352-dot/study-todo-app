// 이 파일은 page.tsx(홈 화면)의 동작을 자동으로 검증하는 테스트입니다.
// 실제 서버/DB 없이 fetch를 가짜(mock)로 대체해서 테스트합니다.

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, beforeEach } from "vitest";
import Home from "./page";

// fetch를 가짜 함수로 교체합니다 (실제 API 호출 안 함)
const mockFetch = vi.fn();
global.fetch = mockFetch;

// DB에서 받아오는 형식의 가짜 태스크 데이터
const fakeMorningTask = {
  id: 1,
  title: "운동하기",
  section: "morning",
  done: false,
  startedAt: null,
  emoji: "☀️",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// 각 테스트 전에 mock을 초기화합니다
beforeEach(() => {
  mockFetch.mockReset();
});

// fetch 응답을 만들어주는 헬퍼 함수
function mockResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("Home", () => {
  it("로딩 후 아침 섹션의 빈 상태 메시지를 표시한다", async () => {
    // GET /api/tasks → 빈 배열 반환
    mockFetch.mockReturnValue(mockResponse([]));

    render(<Home />);

    // 로딩이 끝나면 빈 상태 메시지가 나타납니다
    expect(await screen.findByText("아침 할 일이 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("저녁 할 일이 없습니다.")).toBeInTheDocument();
  });

  it("DB에서 불러온 태스크를 화면에 표시한다", async () => {
    mockFetch.mockReturnValue(mockResponse([fakeMorningTask]));

    render(<Home />);

    expect(await screen.findByText("운동하기")).toBeInTheDocument();
  });

  it("아침 입력창에 태스크를 입력하고 추가하면 목록에 나타난다", async () => {
    const user = userEvent.setup();

    // 첫 번째 fetch(GET)는 빈 배열, 두 번째(POST)는 새 태스크 반환
    mockFetch
      .mockReturnValueOnce(mockResponse([]))
      .mockReturnValueOnce(
        mockResponse({ ...fakeMorningTask, id: 2, title: "공부하기" }, 201)
      );

    render(<Home />);
    await screen.findByText("아침 할 일이 없습니다.");

    const input = screen.getByPlaceholderText("아침 할 일 추가...");
    const addButton = screen.getAllByRole("button", { name: "추가" })[0];

    await user.type(input, "공부하기");
    await user.click(addButton);

    expect(await screen.findByText("공부하기")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("저녁 입력창에 태스크를 입력하고 추가할 수 있다", async () => {
    const user = userEvent.setup();

    mockFetch
      .mockReturnValueOnce(mockResponse([]))
      .mockReturnValueOnce(
        mockResponse({
          ...fakeMorningTask,
          id: 3,
          title: "독서하기",
          section: "evening",
          emoji: "🌙",
        }, 201)
      );

    render(<Home />);
    await screen.findByText("저녁 할 일이 없습니다.");

    const input = screen.getByPlaceholderText("저녁 할 일 추가...");
    const addButtons = screen.getAllByRole("button", { name: "추가" });
    const eveningAddButton = addButtons[1];

    await user.type(input, "독서하기");
    await user.click(eveningAddButton);

    expect(await screen.findByText("독서하기")).toBeInTheDocument();
  });

  it("시작 버튼을 누르면 '진행중'으로 바뀐다", async () => {
    const user = userEvent.setup();

    mockFetch
      .mockReturnValueOnce(mockResponse([fakeMorningTask]))
      // toggleTask의 PATCH 요청
      .mockReturnValueOnce(mockResponse({ ...fakeMorningTask, done: false }));

    render(<Home />);
    await screen.findByText("운동하기");

    const startButton = screen.getByRole("button", { name: "시작" });
    await user.click(startButton);

    expect(await screen.findByRole("button", { name: "진행중" })).toBeInTheDocument();
  });

  it("편집 버튼(✏️)을 누르면 수정 모달이 열린다", async () => {
    const user = userEvent.setup();

    mockFetch.mockReturnValue(mockResponse([fakeMorningTask]));

    render(<Home />);
    await screen.findByText("운동하기");

    const editButton = screen.getByRole("button", { name: "✏️" });
    await user.click(editButton);

    expect(screen.getByText("할 일 수정")).toBeInTheDocument();
  });

  it("모달에서 삭제 버튼을 누르면 태스크가 사라진다", async () => {
    const user = userEvent.setup();

    mockFetch
      .mockReturnValueOnce(mockResponse([fakeMorningTask]))
      // DELETE 요청
      .mockReturnValueOnce(Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) } as Response));

    render(<Home />);
    await screen.findByText("운동하기");

    // 편집 모달 열기
    await user.click(screen.getByRole("button", { name: "✏️" }));
    expect(screen.getByText("할 일 수정")).toBeInTheDocument();

    // 삭제 클릭
    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(screen.queryByText("운동하기")).not.toBeInTheDocument();
    });
    expect(screen.getByText("아침 할 일이 없습니다.")).toBeInTheDocument();
  });
});
