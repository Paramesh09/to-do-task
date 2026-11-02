import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import WeekStrip from '../components/WeekStrip';
import WeekCard from '../components/WeekCard';
import { useTaskActions } from '../context/TaskActionsContext';
import { useTasks, useWeeklySummary } from '../hooks/useTasks';
import { addDays, format, getWeekStart } from '../lib/dates';

export default function Home() {
  const { openCreate } = useTaskActions();
  const { data: weeks, isLoading, isError, error, refetch } = useWeeklySummary();

  const weekStart = getWeekStart();
  const thisWeekKey = weekStart.toISOString();
  // same params as the current week's WeekCard so both share one cached request
  const { data: thisWeekTasks } = useTasks({
    from: thisWeekKey,
    to: addDays(weekStart, 7).toISOString(),
  });

  const [expanded, setExpanded] = useState(() => new Set([thisWeekKey]));
  const toggle = (key) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const current = weeks?.find((w) => w.weekStart === thisWeekKey);
  const upcoming = weeks?.filter((w) => new Date(w.weekStart) >= weekStart) ?? [];
  const earlier = weeks?.filter((w) => new Date(w.weekStart) < weekStart).reverse() ?? [];

  return (
    <div className="pb-32">
      <Link
        to="/search"
        className="flex items-center justify-between rounded-md border border-line px-4 py-3 text-sm text-muted shadow-[0_1px_6px_rgba(27,29,40,0.05)] transition hover:border-brand-500/50"
      >
        Search for a task
        <Search size={20} className="text-ink" />
      </Link>

      <p className="mt-6 mb-2 text-xs font-medium text-muted">{format(new Date(), 'MMMM yyyy')}</p>
      <WeekStrip tasks={thisWeekTasks} />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard variant="completed" label="Task Complete" value={current?.completed ?? 0} />
        <StatCard variant="pending" label="Task Pending" value={current?.open ?? 0} />
      </div>

      <div className="mt-7">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">Weekly Progress</h2>
          {current && (
            <span className="text-xs text-muted">
              {current.completed}/{current.total} done
            </span>
          )}
        </div>
        <ProgressBar value={current?.completed ?? 0} max={current?.total ?? 0} label="This week's progress" />
      </div>

      <section className="mt-8">
        {isLoading && <LoadingWeeks />}

        {isError && (
          <div className="rounded-lg bg-danger-50 p-4 text-sm text-danger-500">
            <p>{error.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-2 font-medium underline">
              Try again
            </button>
          </div>
        )}

        {weeks && weeks.length === 0 && (
          <div className="rounded-lg border border-dashed border-line px-6 py-10 text-center">
            <p className="font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted">Tap the + button to plan your first task.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <WeekList title="Your Weeks" weeks={upcoming} expanded={expanded} onToggle={toggle} />
        )}
        {earlier.length > 0 && (
          <WeekList title="Earlier" weeks={earlier} expanded={expanded} onToggle={toggle} className="mt-8" />
        )}
      </section>

      <button
        type="button"
        onClick={() => openCreate()}
        aria-label="Add task"
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-30 grid size-16 -translate-x-1/2 place-items-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

function WeekList({ title, weeks, expanded, onToggle, className = '' }) {
  return (
    <div className={className}>
      <h2 className="mb-3 font-semibold">{title}</h2>
      <div className="space-y-3">
        {weeks.map((week) => (
          <WeekCard
            key={week.weekStart}
            week={week}
            expanded={expanded.has(week.weekStart)}
            onToggle={() => onToggle(week.weekStart)}
          />
        ))}
      </div>
    </div>
  );
}

function LoadingWeeks() {
  // the free Render instance sleeps when idle, so the first request can be slow
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div aria-busy="true">
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-brand-50" />
        ))}
      </div>
      {slow && <p className="mt-3 text-center text-xs text-muted">Waking up the server, this can take a few seconds…</p>}
    </div>
  );
}
