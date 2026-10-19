// Kisebb, sokfelé használt felületi elemek egy helyen.

export function PageHeader({ eyebrow, title, accent, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-4xl">
          {title} {accent && <em className="text-accent">{accent}</em>}
        </h1>
      </div>
      {children}
    </header>
  );
}

export function StatTile({ label, value, tone = "accent" }) {
  const tones = { accent: "text-accent", sage: "text-sage", teal: "text-teal", sand: "text-sand" };
  return (
    <div className="card px-5 py-4">
      <p className={`font-display text-3xl tabular-nums lining-nums ${tones[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

// Egymást kizáró gombok (pl. státusz, formátum)
export function Segmented({ options, value, onChange, size = "md" }) {
  const pad = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(options).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full border transition ${pad} ${
            value === key
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-muted hover:border-line-strong hover:text-fg"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "border border-line text-fg hover:border-line-strong hover:bg-surface-2",
  ghost: "text-muted hover:text-fg",
};

// Gomb-kinézet osztályai – linkekhez is használható (<Link className={buttonClass()}>)
export function buttonClass(variant = "primary", className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", ...props }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}

export function Section({ title, children, className = "" }) {
  return (
    <section className={className}>
      <h2 className="eyebrow mb-3">{title}</h2>
      {children}
    </section>
  );
}
