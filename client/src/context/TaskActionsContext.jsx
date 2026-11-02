import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import TaskFormSheet from '../components/TaskFormSheet';
import TaskDetailsSheet from '../components/TaskDetailsSheet';
import ConfirmDialog from '../components/ConfirmDialog';
import { useDeleteTask } from '../hooks/useTasks';

const TaskActionsContext = createContext(null);

// Create / edit / view / delete can be triggered from the home screen and from
// search, so the sheets live here once instead of being duplicated in each page.
export function TaskActionsProvider({ children }) {
  const [form, setForm] = useState({ open: false, task: null, weekStart: null });
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteTask = useDeleteTask();

  const actions = useMemo(
    () => ({
      openCreate: (weekStart = null) => setForm({ open: true, task: null, weekStart }),
      openEdit: (task) => {
        setViewing(null);
        setForm({ open: true, task, weekStart: null });
      },
      openView: (task) => setViewing(task),
      askDelete: (task) => setDeleting(task),
    }),
    []
  );

  const closeForm = useCallback(() => setForm((f) => ({ ...f, open: false })), []);
  const closeDelete = useCallback(() => setDeleting(null), []);

  function confirmDelete() {
    deleteTask.mutate(deleting.id);
    if (viewing?.id === deleting.id) setViewing(null);
    setDeleting(null);
  }

  return (
    <TaskActionsContext.Provider value={actions}>
      {children}

      <TaskFormSheet open={form.open} task={form.task} weekStart={form.weekStart} onClose={closeForm} />

      <TaskDetailsSheet
        task={viewing}
        onClose={() => setViewing(null)}
        onChange={setViewing}
        onEdit={actions.openEdit}
        onDelete={actions.askDelete}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete task?"
        message={deleting ? `"${deleting.title}" will be removed permanently.` : ''}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </TaskActionsContext.Provider>
  );
}

export function useTaskActions() {
  const ctx = useContext(TaskActionsContext);
  if (!ctx) throw new Error('useTaskActions must be used inside TaskActionsProvider');
  return ctx;
}
