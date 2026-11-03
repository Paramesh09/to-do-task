import { useNavigate } from 'react-router';
import { markOnboarded } from '../lib/onboarding';

export default function Welcome() {
  const navigate = useNavigate();

  function getStarted() {
    markOnboarded();
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* takes whatever the text block doesn't need, about two thirds of a phone screen like the design */}
      <div className="relative flex-1 overflow-hidden bg-brand-500">
        <span className="absolute -top-14 -right-10 size-36 rounded-full border-[22px] border-white/15" />
        <Zigzag className="absolute top-[22%] left-0 w-28 text-white/15" />
        <Zigzag className="absolute right-0 bottom-[14%] w-28 text-white/15" />
      </div>

      <div className="flex min-h-[35dvh] flex-col justify-between px-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div>
          <h1 className="text-2xl font-semibold">Manage What To Do</h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            The best way to manage what you have to do, don&apos;t forget your plans
          </p>
        </div>
        <button
          type="button"
          onClick={getStarted}
          className="mt-8 w-full rounded-md bg-brand-500 py-3.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

function Zigzag({ className }) {
  return (
    <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" strokeWidth="5" className={className} aria-hidden="true">
      {[8, 26, 44, 62].map((y) => (
        <path key={y} d={`M0 ${y} l14 -8 l14 8 l14 -8 l14 8 l14 -8 l14 8 l14 -8 l14 8`} />
      ))}
    </svg>
  );
}
