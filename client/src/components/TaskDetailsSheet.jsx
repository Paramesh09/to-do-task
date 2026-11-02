import { CalendarDays, CircleCheck, Flag, SquarePen, Trash2 } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { PRIORITY_LABELS } from './PriorityBadge';
import { useUpdateTask } from '../hooks/useTasks';
import { format } from '../lib/dates';

export default function TaskDetailsSheet({ task, onClose, onChange, onEdit, onDelete }) {
  const updateTask = useUpdateTask();

  if (!task) return null;
  const completed = task.status === 'completed';

  function toggleStatus() {
    const status = completed ? 'in_progress' : 'completed';
    onChange({ ...task, status });
    updateTask.mutate(
      { id: task.id, changes: { status } },
      { onSuccess: onChange, onError: () => onChange(task) }
    );
  }

  return (
    <BottomSheet open title="Task Details" onClose={onClose}>
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
          completed ? 'bg-brand-50 text-brand-500' : 'bg-danger-50 text-danger-500'
        }`}
      >
        {completed ? 'Completed' : 'In Progress'}
      </span>

      <h3 className={`mt-3 text-xl font-semibold break-words ${completed ? 'text-muted line-through' : ''}`}>
        {task.title}
      </h3>

      <dl className="mt-5 space-y-3 text-sm">
        <Detail icon={CalendarDays} label="Due">
          {format(new Date(task.dueAt), "EEEE, d MMMM yyyy 'at' h:mm a")}
        </Detail>
        <Detail icon={Flag} label="Priority">
          {task.priority ? PRIORITY_LABELS[task.priority] : 'Not set'}
        </Detail>
        {completed && task.completedAt && (
          <Detail icon={CircleCheck} label="Completed">
            {format(new Date(task.completedAt), 'd MMM yyyy, h:mm a')}
          </Detail>
        )}
      </dl>

      <div className="mt-5">
        <p className="mb-1.5 text-xs text-muted">Description</p>
        <p className="min-h-16 rounded-md bg-brand-50/60 p-3 text-sm whitespace-pre-wrap break-words">
          {task.description || <span className="text-muted">No description</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={toggleStatus}
        className="mt-6 w-full rounded-md bg-brand-500 py-3.5 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        {completed ? 'Mark as In Progress' : 'Mark as Completed'}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="flex items-center justify-center gap-2 rounded-md border border-line py-3 text-sm font-medium transition hover:bg-brand-50"
        >
          <SquarePen size={16} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="flex items-center justify-center gap-2 rounded-md border border-danger-50 bg-danger-50 py-3 text-sm font-medium text-danger-500 transition hover:brightness-95"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </BottomSheet>
  );
}

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="shrink-0 text-brand-500" />
      <dt className="w-20 shrink-0 text-muted">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
