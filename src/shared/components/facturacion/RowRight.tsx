export const RowRight: React.FC<{
  label: string;
  value?: string;
  bold?: boolean;
  badge?: string;
}> = ({ label, value = "—", bold, badge = "" }) => (
  <div className="px-5 py-3 grid grid-cols-12 items-center text-sm">
    <div className="col-span-8 sm:col-span-10 text-slate-700">{label}</div>
    <div
      className={`col-span-4 sm:col-span-2 text-right ${bold ? "font-semibold text-slate-900" : "font-medium text-slate-800"
        }`}
    >
      {badge ? <span className={badge}>{value}</span> : value}
    </div>
  </div>
);