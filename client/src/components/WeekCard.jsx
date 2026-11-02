import { useId } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import ProgressBar from './ProgressBar';
import { useTaskActions } from '../context/TaskActionsContext';
import { useTasks } from '../hooks/useTasks';
import { formatWeekRange, relativeWeekLabel } from '../lib/dates';

export default function WeekCard({ week, expanded, onToggle }) {
  const panelId = useId();
  const label = relativeWeekLabel(week.weekStart);
  const isCurrent = label === 'This week';

  return (
    <section
      className={`rounded-lg border bg-white shadow-[0_2px_12px_rgba(27,29,40,0.04)] ${
        isCurrent ? 'border-brand-500/40' : 'border-line'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs ${isCurrent ? 'font-medium text-brand-500' : 'text-muted'}`}>{label}</p>
            <h3 className="mt-0.5 font-semibold">{formatWeekRange(week.weekStart)}</h3>
          </div>
          <ChevronDown
            size={20}
            className={`mt-1 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-danger-50 px-2.5 py-1 text-danger-500">
            <strong className="font-semibold">{week.open}</strong> Open
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-500">
            <strong className="font-semibold">{week.completed}</strong> Completed
          </span>
        </div>
        <ProgressBar
          value={week.completed}
          max={week.total}
          label={`${formatWeekRange(week.weekStart)} progress`}
          className="mt-3 h-1.5"
        />
      </button>

      {expanded && (
        <div id={panelId} className="border-t border-line px-4">
          <WeekTasks week={week} />
        </div>
      )}
    </section>
  );
}

function WeekTasks({ week }) {
  const { openCreate } = useTaskActions();
  const { data: tasks, isLoading, isError, refetch } = useTasks({ from: week.weekStart, to: week.weekEnd });

  if (isLoading) {
    return (
      <ul className="py-2" aria-busy="true">
        {[0, 1].map((i) => (
          <li key={i} className="flex items-center gap-3 py-4">
            <div className="size-5 animate-pulse rounded bg-line" />
            <div className="h-3.5 flex-1 animate-pulse rounded bg-line" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <p className="py-4 text-sm text-danger-500">
        Couldn&apos;t load tasks.{' '}
        <button type="button" onClick={() => refetch()} className="font-medium underline">
          Retry
        </button>
      </p>
    );
  }

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => openCreate(week.weekStart)}
        className="-mx-4 flex w-[calc(100%+2rem)] items-center justify-center gap-1.5 rounded-b-lg border-t border-line py-3 text-sm font-medium text-brand-500 transition hover:bg-brand-50"
      >
        <Plus size={16} /> Add task to this week
      </button>
    </>
  );
}
