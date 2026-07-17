function IconImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L4 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-muted${
        className ? ` ${className}` : ""
      }`}
    >
      <IconImage className="h-6 w-6" />
      <span className="font-mono text-[10px] tracking-wide uppercase">
        Add photo
      </span>
    </div>
  );
}
