'use client'

import { useState } from 'react'
import type { Todo } from '../types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function handleSave() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onEdit(todo.id, trimmed)
    setIsEditing(false)
  }

  function handleCancel() {
    setDraft(todo.text)
    setIsEditing(false)
  }

  return (
    <li className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <label className="flex items-center gap-3 min-w-0">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="h-5 w-5 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
            />
            {isEditing ? (
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            ) : (
              <span
                className={`min-w-0 text-sm leading-6 ${
                  todo.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                }`}
              >
                {todo.text}
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                저장
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => onDelete(todo.id)}
                className="rounded-2xl border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
