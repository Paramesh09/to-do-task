import { useEffect, useRef, useState } from 'react';
import { Eye, SquarePen, Trash2 } from 'lucide-react';
import Checkbox from './Checkbox';
import PriorityBadge from './PriorityBadge';
import { useTaskActions } from '../context/TaskActionsContext';
import { useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { formatDueDate } from '../lib/dates';

const ACTION_WIDTH = 88;

export default function TaskItem({ task, highlight, onSelect, showView = false }) {
  const { openEdit, openView, askDelete } = useTaskActions();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const rowRef = useRef(null);
  const drag = useRef(null);
  const didDrag = useRef(false);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const isOpen = offset !== 0;
  const completed = task.status === 'completed';
  const select = onSelect ?? openEdit;

  // close the swiped row when tapping anywhere else
  useEffect(() => {
    if (!isOpen || dragging) return;
    const close = (e) => {
      if (!rowRef.current?.contains(e.target)) setOffset(0);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [isOpen, dragging]);

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, base: offset, axis: null };
    didDrag.current = false;
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;

    // wait until we know if the user is swiping sideways or scrolling the page
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (d.axis === 'x') {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }
    }
    if (d.axis !== 'x') return;

    didDrag.current = true;
    setOffset(Math.min(0, Math.max(-ACTION_WIDTH * 1.3, d.base + dx)));
  }

  function onPointerEnd() {
    const d = drag.current;
    drag.current = null;
    if (d?.axis !== 'x') return;
    setDragging(false);
    setOffset((current) => (current < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0));
  }

  function onRowClick() {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    if (isOpen) {
      setOffset(0);
      return;
    }
    select(task);
  }

  const toggleStatus = (checked) =>
    updateTask.mutate({ id: task.id, changes: { status: checked ? 'completed' : 'in_progress' } });

  return (
    <li ref={rowRef} className="relative overflow-hidden border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => deleteTask.mutate(task.id)}
        tabIndex={isOpen ? 0 : -1}
        aria-hidden={!isOpen}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 bg-danger-500 text-xs font-medium text-white"
        style={{ width: ACTION_WIDTH }}
      >
        <Trash2 size={18} />
        Delete
      </button>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={onRowClick}
        className="relative flex cursor-pointer touch-pan-y items-center gap-3 bg-white py-4 select-none"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 200ms ease',
        }}
      >
        <Checkbox
          checked={completed}
          onChange={toggleStatus}
          label={completed ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as completed`}
        />

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-medium ${completed ? 'text-muted line-through' : ''}`}>
            <Highlight text={task.title} query={highlight} />
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span>{formatDueDate(task.dueAt)}</span>
            <PriorityBadge priority={task.priority} />
          </div>
          {highlight && task.description && (
            <p className="mt-1 truncate text-xs text-muted">
              <Highlight text={task.description} query={highlight} />
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center text-muted" onPointerDown={(e) => e.stopPropagation()}>
          {showView && (
            <IconButton label="View task" onClick={() => openView(task)}>
              <Eye size={18} />
            </IconButton>
          )}
          <IconButton label="Delete task" onClick={() => askDelete(task)}>
            <Trash2 size={18} />
          </IconButton>
          <IconButton label="Edit task" onClick={() => openEdit(task)}>
            <SquarePen size={18} />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="rounded-md p-2 transition hover:bg-brand-50 hover:text-brand-500"
    >
      {children}
    </button>
  );
}

function Highlight({ text, query }) {
  const q = query?.trim();
  if (!q) return text;

  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-brand-100 text-inherit">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}
