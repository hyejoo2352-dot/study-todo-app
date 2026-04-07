"use client";

import { useState, useEffect } from "react";

// UI에서만 사용하는 Task 타입 (running, updatedLabel은 DB에 저장하지 않음)
type Task = {
  id: number;
  title: string;
  section: "morning" | "evening";
  done: boolean;
  running: boolean;
  startedAt: Date | null;
  emoji: string;
  updatedLabel: string;
};

// DB에서 받아오는 원본 타입 (날짜가 문자열로 옴)
type DBTask = {
  id: number;
  title: string;
  section: "morning" | "evening";
  done: boolean;
  startedAt: string | null;
  emoji: string;
  createdAt: string;
  updatedAt: string;
};

// DB 데이터 → UI 타입으로 변환
function toUITask(t: DBTask): Task {
  return {
    id: t.id,
    title: t.title,
    section: t.section,
    done: t.done,
    running: false, // 새로고침 시 항상 초기화
    startedAt: t.startedAt ? new Date(t.startedAt) : null,
    emoji: t.emoji,
    updatedLabel: t.done ? "오늘 완수" : "Last Updated: Today",
  };
}

const PASTEL_COLORS = [
  "bg-blue-100",
  "bg-purple-100",
  "bg-green-100",
  "bg-pink-100",
  "bg-yellow-100",
  "bg-orange-100",
  "bg-teal-100",
];

function getPastelColor(id: number) {
  return PASTEL_COLORS[id % PASTEL_COLORS.length];
}

function getWeekDays(today: Date) {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Home() {
  const today = new Date();
  const weekDays = getWeekDays(today);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [morningInput, setMorningInput] = useState("");
  const [eveningInput, setEveningInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSection, setEditSection] = useState<"morning" | "evening">("morning");
  const [tick, setTick] = useState(0);

  // 페이지가 처음 열릴 때 DB에서 태스크를 불러옵니다
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: DBTask[]) => setTasks(data.map(toUITask)))
      .finally(() => setLoading(false));
  }, []);

  // 1분마다 "Active For" 시간을 갱신합니다
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  function getActiveMinutes(task: Task) {
    if (!task.startedAt) return 0;
    return Math.floor((Date.now() - task.startedAt.getTime()) / 60000);
  }

  async function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.running && !t.done) {
          return { ...t, running: true, startedAt: new Date(), updatedLabel: "Active For: 0 min" };
        }
        if (t.running) {
          return { ...t, running: false, done: true, updatedLabel: "오늘 완수" };
        }
        return { ...t, done: false, running: false, startedAt: null, updatedLabel: "Last Updated: Today" };
      })
    );

    // 변경된 상태를 DB에 반영합니다
    const current = tasks.find((t) => t.id === id);
    if (!current) return;

    let patch: Record<string, unknown>;
    if (!current.running && !current.done) {
      patch = { startedAt: new Date().toISOString(), done: false };
    } else if (current.running) {
      patch = { done: true };
    } else {
      patch = { done: false, startedAt: null };
    }

    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function addTask(section: "morning" | "evening") {
    const title = section === "morning" ? morningInput.trim() : eveningInput.trim();
    if (!title) return;

    const emoji = section === "morning" ? "☀️" : "🌙";

    // DB에 저장 후, 받아온 ID로 UI 목록에 추가합니다
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, section, emoji }),
    });
    const created: DBTask = await res.json();
    setTasks((prev) => [...prev, toUITask(created)]);

    if (section === "morning") setMorningInput("");
    else setEveningInput("");
  }

  function openEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditSection(task.section);
  }

  async function saveEdit() {
    if (!editTitle.trim() || editingId === null) return;

    await fetch(`/api/tasks/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), section: editSection }),
    });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingId ? { ...t, title: editTitle.trim(), section: editSection } : t
      )
    );
    setEditingId(null);
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setEditingId(null);
  }

  function getButtonLabel(task: Task) {
    if (task.done) return "완료";
    if (task.running) return "진행중";
    return "시작";
  }

  function getButtonStyle(task: Task) {
    if (task.done) return "bg-slate-100 text-slate-500 border border-slate-200";
    if (task.running) return "bg-indigo-500 text-white";
    return "bg-white text-slate-700 border border-slate-200";
  }

  const morning = tasks.filter((t) => t.section === "morning");
  const evening = tasks.filter((t) => t.section === "evening");
  const morningDone = morning.filter((t) => t.done).length;
  const eveningDone = evening.filter((t) => t.done).length;

  void tick;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-sm md:max-w-md flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Today</p>
            <p className="text-2xl font-bold text-slate-800">
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors overflow-hidden">
            <span className="text-lg">👤</span>
          </button>
        </div>

        {/* Weekly Calendar Strip */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="flex justify-between">
            {weekDays.map((day) => {
              const isToday = day.toDateString() === today.toDateString();
              const hasDot = isToday && tasks.some((t) => t.done);
              return (
                <div key={day.toDateString()} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-slate-400">{DAY_LABELS[day.getDay()]}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isToday ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasDot ? "bg-indigo-400" : "bg-transparent"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 로딩 중 표시 */}
        {loading && (
          <p className="text-center text-sm text-slate-400 py-4">불러오는 중...</p>
        )}

        {/* Morning Circle */}
        {!loading && (
          <Section
            icon="☀️"
            title="Morning Circle"
            done={morningDone}
            total={morning.length}
            input={morningInput}
            onInputChange={setMorningInput}
            onAdd={() => addTask("morning")}
            placeholder="아침 할 일 추가..."
          >
            {morning.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                activeMinutes={getActiveMinutes(task)}
                pastelColor={getPastelColor(task.id)}
                buttonLabel={getButtonLabel(task)}
                buttonStyle={getButtonStyle(task)}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => openEdit(task)}
              />
            ))}
            {morning.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-4">아침 할 일이 없습니다.</p>
            )}
          </Section>
        )}

        {/* Evening Circle */}
        {!loading && (
          <Section
            icon="🌙"
            title="Evening Circle"
            done={eveningDone}
            total={evening.length}
            input={eveningInput}
            onInputChange={setEveningInput}
            onAdd={() => addTask("evening")}
            placeholder="저녁 할 일 추가..."
          >
            {evening.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                activeMinutes={getActiveMinutes(task)}
                pastelColor={getPastelColor(task.id)}
                buttonLabel={getButtonLabel(task)}
                buttonStyle={getButtonStyle(task)}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => openEdit(task)}
              />
            ))}
            {evening.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-4">저녁 할 일이 없습니다.</p>
            )}
          </Section>
        )}
      </div>

      {/* Edit Modal */}
      {editingId !== null && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end justify-center z-50 pb-8 px-4"
          onClick={(e) => e.target === e.currentTarget && setEditingId(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm md:max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-800">할 일 수정</h2>

            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setEditSection("morning")}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                  editSection === "morning"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ☀️ Morning
              </button>
              <button
                onClick={() => setEditSection("evening")}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                  editSection === "evening"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                🌙 Evening
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => deleteTask(editingId)}
                className="flex-1 rounded-xl py-2 text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 rounded-xl py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 rounded-xl py-2 text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  done,
  total,
  input,
  onInputChange,
  onAdd,
  placeholder,
  children,
}: {
  icon: string;
  title: string;
  done: number;
  total: number;
  input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-bold text-slate-800">{title}</span>
        <span className="ml-auto text-xs text-slate-400 font-medium">
          {done}/{total} 완료
        </span>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          placeholder={placeholder}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
        />
        <button
          onClick={onAdd}
          className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 transition-colors shadow-sm"
        >
          추가
        </button>
      </div>

      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function TaskCard({
  task,
  activeMinutes,
  pastelColor,
  buttonLabel,
  buttonStyle,
  onToggle,
  onEdit,
}: {
  task: Task;
  activeMinutes: number;
  pastelColor: string;
  buttonLabel: string;
  buttonStyle: string;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const subLabel = task.running
    ? `Active For: ${activeMinutes} min`
    : task.updatedLabel;

  const subColor = task.running
    ? "text-indigo-500 font-medium"
    : "text-slate-400";

  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 transition-opacity ${
        task.done ? "opacity-60" : "opacity-100"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl ${pastelColor} flex items-center justify-center text-2xl flex-shrink-0`}
      >
        {task.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold text-slate-800 truncate ${
            task.done ? "line-through text-slate-400" : ""
          }`}
        >
          {task.title}
        </p>
        <p className={`text-xs mt-0.5 ${subColor}`}>{subLabel}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggle}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${buttonStyle}`}
        >
          {buttonLabel}
        </button>
        <button
          onClick={onEdit}
          className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors text-xs"
        >
          ✏️
        </button>
      </div>
    </div>
  );
}
