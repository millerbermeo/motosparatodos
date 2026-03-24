import React from 'react'

const DataRow: React.FC<{
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  valueClass?: string;
  showCop?: boolean;
}> = ({
  label,
  value,
  strong,
  valueClass,
  showCop = true,
}) => (
  <div className="flex items-center justify-between bg-[#3498DB]/70 text-white px-3 py-2 rounded-md">
    <span className="font-medium">{label}</span>

    <span className={`${strong ? 'font-bold' : ''} ${valueClass || ''}`}>
      {value}
      {showCop && ' COP'}
    </span>
  </div>
);

export default DataRow