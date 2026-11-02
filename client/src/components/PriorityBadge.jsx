const STYLES = {
  high: 'bg-danger-50 text-danger-500',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

export default function PriorityBadge({ priority }) {
  if (!priority) return null;
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STYLES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
