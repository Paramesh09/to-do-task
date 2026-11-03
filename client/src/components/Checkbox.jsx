import { Check } from 'lucide-react';

export default function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`grid size-5 shrink-0 place-items-center rounded border-[1.5px] transition ${
        checked ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-brand-500/60 bg-white hover:border-brand-500'
      }`}
    >
      {checked && <Check size={13} strokeWidth={3} />}
    </button>
  );
}
