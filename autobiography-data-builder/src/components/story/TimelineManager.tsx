"use client";

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { TimelineEvent } from "@/types/story";

type TimelineManagerProps = {
  events: TimelineEvent[];
  onCreate: (event: Omit<TimelineEvent, "id">) => Promise<void> | void;
  onUpdate: (id: string, data: Partial<TimelineEvent>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

const emptyEvent = {
  title: "",
  date: "",
  description: "",
  imageUrl: "",
  notes: "",
};

export function TimelineManager({ events, onCreate, onUpdate, onDelete }: TimelineManagerProps) {
  const [draft, setDraft] = useState(emptyEvent);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const reset = () => {
    setDraft(emptyEvent);
    setIsAdding(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title || !draft.date || !draft.description) {
      toast.error("Please fill in title, date, and description");
      return;
    }

    try {
      setIsAdding(true);
      await onCreate({
        title: draft.title,
        date: draft.date,
        description: draft.description,
        imageUrl: draft.imageUrl || undefined,
        notes: draft.notes || undefined,
      });
      toast.success("Event added to timeline");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add event");
    } finally {
      setIsAdding(false);
    }
  };

  const handleInlineUpdate = async (
    id: string,
    field: keyof TimelineEvent,
    value: string
  ) => {
    setLoadingId(id);
    try {
      await onUpdate(id, { [field]: value });
    } catch (error) {
      console.error(error);
      toast.error("Could not update event");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      await onDelete(id);
      toast.success("Event removed");
    } catch (error) {
      console.error(error);
      toast.error("Could not delete event");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Life timeline</h3>
          <p className="text-sm text-white/70">
            Map meaningful milestones with images or notes.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
          {events.length} events
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-white/80">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Graduation, first job, etc."
            />
          </div>
          <div>
            <label className="text-sm text-white/80">Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={draft.date}
              onChange={(event) => setDraft((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-white/80">Description</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Share details, emotions, or context."
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-white/80">Image (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={draft.imageUrl}
              onChange={(event) => setDraft((prev) => ({ ...prev, imageUrl: event.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm text-white/80">Notes (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={draft.notes}
              onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Who was there, lessons learned..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
            onClick={reset}
          >
            Clear
          </button>
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
            disabled={isAdding}
          >
        {isAdding ? "Adding..." : "Add event"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/60">
            Add your first milestone to bring your journey to life.
          </div>
        ) : (
          sortedEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <input
                  className="flex-1 rounded-lg border border-white/10 bg-transparent px-0 py-0 text-lg font-semibold text-white focus:border-emerald-400 focus:outline-none"
                  value={event.title}
                  onChange={(e) => handleInlineUpdate(event.id, "title", e.target.value)}
                />
                <input
                  type="date"
                  className="rounded-lg border border-white/10 bg-transparent px-3 py-1 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  value={event.date}
                  onChange={(e) => handleInlineUpdate(event.id, "date", e.target.value)}
                />
              </div>

              <textarea
                className="mt-3 w-full rounded-lg border border-white/10 bg-transparent px-0 py-0 text-sm text-white/80 focus:border-emerald-400 focus:outline-none"
                value={event.description}
                onChange={(e) => handleInlineUpdate(event.id, "description", e.target.value)}
              />

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  className="rounded-lg border border-white/10 bg-transparent px-0 py-0 text-sm text-white/70 focus:border-emerald-400 focus:outline-none"
                  placeholder="Image URL"
                  value={event.imageUrl || ""}
                  onChange={(e) => handleInlineUpdate(event.id, "imageUrl", e.target.value)}
                />
                <input
                  className="rounded-lg border border-white/10 bg-transparent px-0 py-0 text-sm text-white/70 focus:border-emerald-400 focus:outline-none"
                  placeholder="Notes"
                  value={event.notes || ""}
                  onChange={(e) => handleInlineUpdate(event.id, "notes", e.target.value)}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                <span>
                  {event.date ? format(new Date(event.date), "PPP") : "No date"}
                </span>
                <div className="flex items-center gap-2">
                  {loadingId === event.id && <span className="text-emerald-300">Saving...</span>}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
