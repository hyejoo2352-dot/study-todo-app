'use client'

import { useEffect, useMemo, useState } from 'react'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'
import type { Todo } from '../types/todo'

type Filter = 'all' | 'active' | 'completed'
const FILTERS: Filter[] = ['all', 'active', 'completed']
const STORAGE_KEY = 'study-todo-app-todos'

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Todo[]
      setTodos(parsed)
    } catch {
      setTodos([])
    }
  }, [])

  useEffect(() => {
    if (todos.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [todos, filter])

  const remaining = todos.filter((todo) => !todo.completed).length

  function handleAdd(text: string) {
    setTodos((current) => [{ id: createId(), text, completed: false }, ...current])
  }

  function handleToggle(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function handleDelete(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function handleEdit(id: string, text: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    )
  }

  function handleClearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/20 ring-1 ring-white/5">
        <section className="space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">간단한 TODO 앱</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">할 일 관리</h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-400">
              localStorage 저장, 편집, 필터 기능이 포함된 최소한의 Next.js App Router TODO 앱입니다.
            </p>
          </div>

          <TodoForm onAdd={handleAdd} />

          <div className="flex flex-col gap-4 rounded-3xl bg-slate-950/90 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-slate-300">
                남은 할 일: <span className="font-semibold text-slate-100">{remaining}</span>
              </p>
              <p className="text-xs text-slate-500">전체 {todos.length}개</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filter === option
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {option === 'all' ? '전체' : option === 'active' ? '진행 중' : '완료'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearCompleted}
              disabled={!todos.some((todo) => todo.completed)}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              완료된 항목 삭제
            </button>
          </div>

          <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
        </section>
      </div>
    </main>
  )
}
