import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import { useTaskActions } from '../context/TaskActionsContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useTasks } from '../hooks/useTasks';

export default function Search() {
  const navigate = useNavigate();
  const { openView } = useTaskActions();

  // keeping the query in the url means going back from a task keeps the results
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const debounced = useDebouncedValue(query.trim());

  const { data: results, isFetching, isError, error } = useTasks(
    { search: debounced },
    { enabled: debounced.length > 0, placeholderData: (prev) => prev }
  );

  function goBack() {
    // opened directly (e.g. a shared link) there is nothing to go back to
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  }

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={goBack}
        aria-label="Back"
        className="-ml-2 rounded-full p-2 transition hover:bg-brand-50"
      >
        <ArrowLeft size={22} />
      </button>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          placeholder="Search for a task"
          aria-label="Search tasks"
          className="input pr-11 [&::-webkit-search-cancel-button]:hidden"
          autoFocus
        />
        <SearchIcon size={20} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
      </form>

      <div className="mt-4" aria-live="polite">
        {!debounced && (
          <p className="py-12 text-center text-sm text-muted">Search by title or description.</p>
        )}

        {debounced && isError && <p className="py-6 text-sm text-danger-500">{error.message}</p>}

        {debounced && results && (
          <>
            <p className={`text-xs text-muted transition-opacity ${isFetching ? 'opacity-50' : ''}`}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            {results.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">No tasks match &ldquo;{debounced}&rdquo;</p>
            ) : (
              <ul className="mt-1">
                {results.map((task) => (
                  <TaskItem key={task.id} task={task} highlight={debounced} onSelect={openView} showView />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
