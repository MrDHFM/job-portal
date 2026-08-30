import type { ReactNode, CSSProperties } from "react";

// Bespoke hero decoration: ambient gradient glows + a few hand-drawn
// duotone icons (briefcase, resume, growth chart). Intentionally not
// pulled from an icon library — a stock icon floating in a hero reads
// as a template; a custom gradient-filled shape reads as a considered
// visual choice, in keeping with the site's orange/white/black system.

export function HeroGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="app-blob absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl dark:opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          animationDuration: "18s",
        }}
      />
      <div
        className="app-blob absolute -bottom-32 -right-16 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl dark:opacity-15"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary-dark) 0%, transparent 70%)",
          animationDuration: "22s",
          animationDelay: "3s",
        }}
      />
    </div>
  );
}

function IconShell({
  children,
  gradientId,
}: {
  children: (gradientId: string) => ReactNode;
  gradientId: string;
}) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-dark)" />
        </linearGradient>
      </defs>
      {children(gradientId)}
    </svg>
  );
}

export function HeroBriefcaseIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      <IconShell gradientId="heroBriefcaseGrad">
        {(id) => (
          <>
            <rect x="10" y="24" width="44" height="30" rx="6" fill={`url(#${id})`} fillOpacity="0.18" stroke={`url(#${id})`} strokeWidth="2.5" />
            <path d="M24 24V18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="36" x2="54" y2="36" stroke={`url(#${id})`} strokeWidth="2.5" />
            <rect x="28" y="32" width="8" height="8" rx="2" fill={`url(#${id})`} />
          </>
        )}
      </IconShell>
    </div>
  );
}

export function HeroDocumentIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      <IconShell gradientId="heroDocGrad">
        {(id) => (
          <>
            <path
              d="M16 10h22l10 10v34a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z"
              fill={`url(#${id})`}
              fillOpacity="0.14"
              stroke={`url(#${id})`}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M38 10v10h10" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinejoin="round" />
            <line x1="20" y1="32" x2="40" y2="32" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="39" x2="40" y2="39" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="46" x2="32" y2="46" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="46" cy="46" r="9" fill="white" className="dark:fill-neutral-900" stroke={`url(#${id})`} strokeWidth="2.5" />
            <path d="M42 46l3 3 6-6" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </IconShell>
    </div>
  );
}

export function HeroGrowthIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      <IconShell gradientId="heroGrowthGrad">
        {(id) => (
          <>
            <rect x="12" y="38" width="9" height="16" rx="2" fill={`url(#${id})`} fillOpacity="0.85" />
            <rect x="27" y="26" width="9" height="28" rx="2" fill={`url(#${id})`} fillOpacity="0.85" />
            <rect x="42" y="14" width="9" height="40" rx="2" fill={`url(#${id})`} fillOpacity="0.85" />
            <path d="M12 22l12-8 10 6 14-12" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 8h8v8" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </IconShell>
    </div>
  );
}