export default function ProgressBar({ value, max, label, className = 'h-4' }) {
  const percent = max ? Math.round((value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`overflow-hidden rounded-sm bg-brand-100 ${className}`}
    >
      <div className="h-full bg-brand-900 transition-[width] duration-500" style={{ width: `${percent}%` }} />
    </div>
  );
}
