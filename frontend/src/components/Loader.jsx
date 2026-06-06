export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-400 text-xs uppercase tracking-[0.18em]">
      <span className="w-1.5 h-1.5 rounded-full bg-brass-400 animate-pulse" />
      {label}
    </div>
  );
}
