"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getInsforge, type Todo } from "@/lib/insforge";

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden>
      <path
        d="M2 6l2.5 2.5L10 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M8.75 2A2.75 2.75 0 0 0 6 4.75V5H3.75a.75.75 0 0 0 0 1.5h.305l.54 9.043A2.75 2.75 0 0 0 7.34 18.5h5.32a2.75 2.75 0 0 0 2.745-2.957l.54-9.043h.305a.75.75 0 0 0 0-1.5H14v-.25A2.75 2.75 0 0 0 11.25 2h-2.5ZM7.5 4.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25V5h-5v-.25ZM5.91 6.5l.515 8.63a1.25 1.25 0 0 0 1.248 1.17h5.32a1.25 1.25 0 0 0 1.248-1.17l.515-8.63H5.91Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.is_completed).length,
    [todos],
  );
  const pendingCount = todos.length - completedCount;
  const progress = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

  const fetchTodos = useCallback(async () => {
    const { data, error: fetchError } = await getInsforge().database
      .from("todos")
      .select()
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setTodos(data ?? []);
    setError(null);
  }, []);

  useEffect(() => {
    fetchTodos().finally(() => setLoading(false));
  }, [fetchTodos]);

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await getInsforge().database
      .from("todos")
      .insert([{ title: trimmed }])
      .select();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data?.[0]) {
      setTodos((current) => [data[0], ...current]);
    }

    setTitle("");
  }

  async function handleToggleCompletion(todo: Todo) {
    const { data, error: updateError } = await getInsforge().database
      .from("todos")
      .update({ is_completed: !todo.is_completed })
      .eq("id", todo.id)
      .select();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (data?.[0]) {
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? data[0] : item)),
      );
    }

    setError(null);
  }

  async function handleDeleteTask(id: string) {
    const { error: deleteError } = await getInsforge().database
      .from("todos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setTodos((current) => current.filter((item) => item.id !== id));
    setError(null);
  }

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_38%)]"
      />

      <main className="relative w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)]">
          <div className="border-b border-[var(--card-border)] bg-[var(--accent-soft)] px-6 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  InsForge
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                  Task Manager
                </h1>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Stay on top of what matters.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-right shadow-sm">
                <p className="text-2xl font-bold tabular-nums">{todos.length}</p>
                <p className="text-xs text-[var(--muted)]">total tasks</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--muted)]">
                <span>{completedCount} done</span>
                <span>{pendingCount} remaining</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--card)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleAddTask} className="flex gap-3">
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What do you need to get done?"
                className="min-w-0 flex-1 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <PlusIcon />
                Add
              </button>
            </form>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-200 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}

            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-2xl bg-[var(--background)]"
                    />
                  ))}
                </div>
              ) : todos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--background)] px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <CheckIcon />
                  </div>
                  <p className="mt-4 text-base font-medium">No tasks yet</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Add your first task above to get started.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="group flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3.5 transition hover:border-[var(--accent)]/40 hover:shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleCompletion(todo)}
                        aria-label={`Mark "${todo.title}" as ${todo.is_completed ? "incomplete" : "complete"}`}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          todo.is_completed
                            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                            : "border-[var(--card-border)] bg-[var(--card)] text-transparent hover:border-[var(--accent)]"
                        }`}
                      >
                        <CheckIcon />
                      </button>

                      <span
                        className={`min-w-0 flex-1 text-sm leading-6 transition ${
                          todo.is_completed
                            ? "text-[var(--muted)] line-through"
                            : "font-medium"
                        }`}
                      >
                        {todo.title}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(todo.id)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus:opacity-100"
                        aria-label={`Delete "${todo.title}"`}
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
