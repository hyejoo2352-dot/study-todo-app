"use client";

import { useState } from "react";

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput("");
  }

  function toggleTodo(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">
          TODO
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="할 일을 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-zinc-800 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            추가
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {todos.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-8">
              할 일이 없습니다.
            </p>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="h-4 w-4 accent-zinc-700"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.done
                    ? "line-through text-zinc-400"
                    : "text-zinc-800 dark:text-zinc-100"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-zinc-400 hover:text-red-500 transition-colors text-xs"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
