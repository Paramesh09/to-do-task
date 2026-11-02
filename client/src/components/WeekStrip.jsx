import { format, getWeekDays, isSameDay, isToday } from '../lib/dates';

// Mon-Sun row from the design. Days that still have open tasks get a small dot.
export default function WeekStrip({ tasks = [] }) {
  const days = getWeekDays();
  const hasOpenTask = (day) =>
    tasks.some((t) => t.status !== 'completed' && isSameDay(new Date(t.dueAt), day));

  return (
    <ol className="grid grid-cols-7 gap-1 text-center">
      {days.map((day) => {
        const today = isToday(day);
        return (
          <li
            key={day.toISOString()}
            aria-current={today ? 'date' : undefined}
            className={`flex flex-col items-center rounded-md py-2 ${today ? 'bg-brand-500 text-white' : 'text-muted'}`}
          >
            <span className="text-[11px]">{format(day, 'EEE')}</span>
            <span className={`mt-1 text-sm ${today ? 'font-semibold' : 'text-ink/70'}`}>{format(day, 'dd')}</span>
            <span
              className={`mt-1 size-1 rounded-full ${
                hasOpenTask(day) ? (today ? 'bg-white' : 'bg-brand-500') : 'bg-transparent'
              }`}
            />
          </li>
        );
      })}
    </ol>
  );
}
