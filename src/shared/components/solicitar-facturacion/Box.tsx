import React from 'react'

const Box = ({
  title,
  right,
  children,
  tone = "emerald",
}: {
  title: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "emerald" | "sky" | "slate";
}) => {
  const headerCls =
    tone === "sky"
      ? "bg-linear-to-r from-sky-600 to-sky-700"
      : tone === "slate"
        ? "bg-linear-to-r from-slate-700 to-slate-800"
        : "bg-linear-to-r from-emerald-600 to-emerald-700";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header
        className={`${headerCls} text-white px-4 md:px-5 py-3 flex items-center justify-between`}
      >
        <h3 className="font-semibold text-sm md:text-base tracking-tight">
          {title}
        </h3>
        {right ? (
          <div className="text-[11px] md:text-sm opacity-90 font-medium">
            {right}
          </div>
        ) : null}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
};


export default Box