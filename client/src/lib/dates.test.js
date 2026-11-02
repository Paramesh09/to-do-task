import { describe, expect, it } from 'vitest';
import {
  defaultDueDate,
  formatWeekRange,
  fromInputs,
  getWeekDays,
  getWeekStart,
  relativeWeekLabel,
} from './dates';

// months are 0-based: new Date(2026, 10, 4) is Wed 4 Nov 2026
describe('week helpers', () => {
  it('starts weeks on Monday', () => {
    expect(getWeekStart(new Date(2026, 10, 4, 15)).toDateString()).toBe(new Date(2026, 10, 2).toDateString());
    // Sunday still belongs to the week that started the Monday before
    expect(getWeekStart(new Date(2026, 10, 8, 23, 59)).toDateString()).toBe(new Date(2026, 10, 2).toDateString());
  });

  it('returns the seven days Mon-Sun', () => {
    const days = getWeekDays(new Date(2026, 10, 4));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
  });

  it('formats week ranges', () => {
    expect(formatWeekRange(new Date(2026, 10, 2))).toBe('2 – 8 Nov');
    expect(formatWeekRange(new Date(2026, 9, 26))).toBe('26 Oct – 1 Nov');
    expect(formatWeekRange(new Date(2025, 11, 29))).toBe('29 Dec 2025 – 4 Jan 2026');
  });

  it('labels weeks relative to today', () => {
    const today = new Date(2026, 10, 4);
    expect(relativeWeekLabel(new Date(2026, 10, 2), today)).toBe('This week');
    expect(relativeWeekLabel(new Date(2026, 10, 9), today)).toBe('Next week');
    expect(relativeWeekLabel(new Date(2026, 9, 26), today)).toBe('Last week');
    expect(relativeWeekLabel(new Date(2026, 10, 23), today)).toBe('In 3 weeks');
    expect(relativeWeekLabel(new Date(2026, 9, 12), today)).toBe('3 weeks ago');
  });
});

describe('form helpers', () => {
  it('combines date and time inputs as local time', () => {
    const date = fromInputs('2026-11-04', '09:30');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(30);
    expect(fromInputs('', '09:30')).toBeNull();
  });

  it('defaults new tasks to the next full hour', () => {
    const now = new Date(2026, 10, 4, 14, 20);
    const due = defaultDueDate(null, now);
    expect(due.getHours()).toBe(15);
    expect(due.getMinutes()).toBe(0);
  });

  it('moves the default into the selected week', () => {
    const now = new Date(2026, 10, 4, 14, 20);
    // same week -> keep "next hour today"
    expect(defaultDueDate(new Date(2026, 10, 2), now).getDate()).toBe(4);
    // another week -> that week's Monday at the same hour
    const nextWeek = defaultDueDate(new Date(2026, 10, 9), now);
    expect(nextWeek.getDate()).toBe(9);
    expect(nextWeek.getHours()).toBe(15);
  });
});
