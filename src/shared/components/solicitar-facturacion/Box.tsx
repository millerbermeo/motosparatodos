import React from 'react'

const Box = ({
  title,
  right,
  children,
  tone = "emerald",
  icon: Icon,
}: {
  title: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "emerald" | "sky" | "slate";
  icon?: React.ComponentType<{ className?: string }>;
}) => {
  const headerCls =
    tone === "sky"
      ? "bg-linear-to-r from-sky-600 to-sky-700"
      : tone === "slate"
        ? "bg-linear-to-r from-slate-700 to-slate-800"
        : "bg-linear-to-r from-emerald-600 to-emerald-700";

  return (
    <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      <header
        className={`${headerCls} text-white px-4 md:px-5 py-3 flex items-center justify-between gap-2`}
      >
        <h3 className="inline-flex items-center gap-2 font-semibold text-sm md:text-base tracking-tight min-w-0">
          {Icon && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="truncate">{title}</span>
        </h3>
        {right ? (
          <div className="text-[11px] md:text-sm opacity-90 font-medium shrink-0">
            {right}
          </div>
        ) : null}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
};


export default Box