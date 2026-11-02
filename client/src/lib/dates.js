import {
  addDays,
  addHours,
  differenceInCalendarWeeks,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  isYesterday,
  startOfHour,
  startOfWeek,
} from 'date-fns';

export const WEEK_OPTIONS = { weekStartsOn: 1 };

export const userTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function getWeekStart(date = new Date()) {
  return startOfWeek(date, WEEK_OPTIONS);
}

export function getWeekDays(date = new Date()) {
  const start = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameWeek(a, b) {
  return getWeekStart(a).getTime() === getWeekStart(b).getTime();
}

// "2 – 8 Nov", "27 Oct – 2 Nov", "29 Dec 2025 – 4 Jan 2026"
export function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = addDays(start, 6);

  if (start.getFullYear() !== end.getFullYear()) {
    return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')}`;
  }
  if (isSameMonth(start, end)) {
    return `${format(start, 'd')} – ${format(end, 'd MMM')}`;
  }
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
}

export function relativeWeekLabel(weekStart, today = new Date()) {
  const diff = differenceInCalendarWeeks(new Date(weekStart), today, WEEK_OPTIONS);
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  if (diff > 1) return `In ${diff} weeks`;
  return `${Math.abs(diff)} weeks ago`;
}

export function formatDueDate(value) {
  const date = new Date(value);
  const time = format(date, 'h:mm a');
  if (isToday(date)) return `Today, ${time}`;
  if (isTomorrow(date)) return `Tomorrow, ${time}`;
  if (isYesterday(date)) return `Yesterday, ${time}`;
  return `${format(date, 'EEE, d MMM')} · ${time}`;
}

// values for <input type="date"> / <input type="time">
export function toDateInput(date) {
  return format(date, 'yyyy-MM-dd');
}

export function toTimeInput(date) {
  return format(date, 'HH:mm');
}

export function fromInputs(dateStr, timeStr) {
  // "yyyy-MM-ddTHH:mm" without a zone is parsed as local time
  const date = new Date(`${dateStr}T${timeStr}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// New tasks default to the next full hour. When adding from a specific week we
// keep that time but move it into the week (today if it's the current week).
export function defaultDueDate(weekStart, now = new Date()) {
  const next = startOfHour(addHours(now, 1));
  if (!weekStart) return next;

  const start = new Date(weekStart);
  if (isSameWeek(start, now)) return next;

  const day = new Date(start);
  day.setHours(next.getHours(), 0, 0, 0);
  return day;
}

export { addDays, isSameDay, isToday, format };
