import { useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { PRIORITY_LABELS } from './PriorityBadge';
import { useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { defaultDueDate, fromInputs, toDateInput, toTimeInput } from '../lib/dates';

const PRIORITIES = ['low', 'medium', 'high'];

function initialValues(task, weekStart) {
  const due = task ? new Date(task.dueAt) : defaultDueDate(weekStart);
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    date: toDateInput(due),
    time: toTimeInput(due),
    priority: task?.priority ?? null,
    status: task?.status ?? 'in_progress',
  };
}

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Give your task a title';
  if (!values.date) errors.date = 'Pick a date';
  if (!values.time) errors.time = 'Pick a time';
  if (values.date && values.time && !fromInputs(values.date, values.time)) errors.date = 'Invalid date';
  return errors;
}

export default function TaskFormSheet({ open, task, weekStart, onClose }) {
  return (
    <BottomSheet open={open} title={task ? 'Edit Task' : 'Add New Task'} onClose={onClose}>
      {/* keyed so the form resets whenever a different task is opened */}
      <TaskForm key={task?.id ?? `new-${weekStart ?? ''}`} task={task} weekStart={weekStart} onDone={onClose} />
    </BottomSheet>
  );
}

function TaskForm({ task, weekStart, onDone }) {
  const [values, setValues] = useState(() => initialValues(task, weekStart));
  const [errors, setErrors] = useState({});
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const saving = createTask.isPending || updateTask.isPending;

  const setField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _, ...rest }) => rest);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      dueAt: fromInputs(values.date, values.time).toISOString(),
      priority: values.priority,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, changes: { ...payload, status: values.status } });
      } else {
        await createTask.mutateAsync(payload);
      }
      onDone();
    } catch (err) {
      // server side validation messages map onto the same fields
      if (err.errors) {
        const { dueAt, ...rest } = err.errors;
        setErrors({ ...rest, ...(dueAt && { date: dueAt }) });
      }
    }
  }

  const submitError = (createTask.error || updateTask.error)?.message;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Task title" htmlFor="title" error={errors.title}>
        <input
          id="title"
          className="input"
          placeholder="e.g. Doing homework"
          value={values.title}
          onChange={setField('title')}
          maxLength={120}
          autoFocus={!task}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Set Date" htmlFor="date" error={errors.date}>
          <div className="relative">
            <input id="date" type="date" className="input pr-10" value={values.date} onChange={setField('date')} />
            <CalendarDays size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
          </div>
        </Field>
        <Field label="Set Time" htmlFor="time" error={errors.time}>
          <div className="relative">
            <input id="time" type="time" className="input pr-10" value={values.time} onChange={setField('time')} />
            <Clock size={18} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
          </div>
        </Field>
      </div>

      <Field label="Priority">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Priority">
          {PRIORITIES.map((p) => {
            const selected = values.priority === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={selected}
                // clicking the selected one again clears it, priority is optional
                onClick={() => setField('priority')(selected ? null : p)}
                className={`rounded-md border py-2 text-sm transition ${
                  selected
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-line text-ink hover:border-brand-500/50'
                }`}
              >
                {PRIORITY_LABELS[p]}
              </button>
            );
          })}
        </div>
      </Field>

      {task && (
        <Field label="Status">
          <div className="grid grid-cols-2 gap-2 rounded-md bg-brand-50 p-1" role="radiogroup" aria-label="Status">
            {[
              ['in_progress', 'In Progress'],
              ['completed', 'Completed'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={values.status === value}
                onClick={() => setField('status')(value)}
                className={`rounded py-2 text-sm transition ${
                  values.status === value ? 'bg-white font-medium text-brand-500 shadow-sm' : 'text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Description" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          rows={4}
          className="input resize-none"
          placeholder="Add description"
          value={values.description}
          onChange={setField('description')}
          maxLength={1000}
        />
      </Field>

      {submitError && !Object.keys(errors).length && (
        <p className="text-sm text-danger-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-brand-500 py-3.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs text-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
}
