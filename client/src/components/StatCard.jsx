import { Check, X } from 'lucide-react';

const VARIANTS = {
  completed: { bg: 'bg-brand-50', icon: 'border-brand-500 text-brand-500 bg-brand-100', Icon: Check },
  pending: { bg: 'bg-danger-50', icon: 'border-danger-500 text-danger-500 bg-white/60', Icon: X },
};

export default function StatCard({ variant, label, value, caption = 'This Week' }) {
  const { bg, icon, Icon } = VARIANTS[variant];

  return (
    <div className={`rounded-md p-4 ${bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={`grid size-6 place-items-center rounded border-[1.5px] ${icon}`}>
          <Icon size={14} strokeWidth={3} />
        </span>
        <span className="text-xs font-medium sm:text-sm">{label}</span>
      </div>
      <p className="mt-3 flex items-baseline gap-1.5 pl-0.5">
        <span className="text-2xl font-semibold tabular-nums">{String(value).padStart(2, '0')}</span>
        <span className="text-[11px] text-muted">{caption}</span>
      </p>
    </div>
  );
}
