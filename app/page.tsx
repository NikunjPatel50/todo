"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { insforge, type Todo } from "@/lib/insforge";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    const { data, error: fetchError } = await insforge.database
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

    const { data, error: insertError } = await insforge.database
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
    const { data, error: updateError } = await insforge.database
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
    const { error: deleteError } = await insforge.database
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
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Task Manager</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Powered by InsForge
        </p>
      </header>

      <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a new task..."
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading tasks...</p>
      ) : todos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          No tasks yet. Add one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <input
                type="checkbox"
                checked={todo.is_completed}
                onChange={() => handleToggleCompletion(todo)}
                className="h-4 w-4 shrink-0 rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
                aria-label={`Mark "${todo.title}" as ${todo.is_completed ? "incomplete" : "complete"}`}
              />
              <span
                className={`min-w-0 flex-1 text-sm ${todo.is_completed ? "text-zinc-400 line-through" : ""}`}
              >
                {todo.title}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteTask(todo.id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
