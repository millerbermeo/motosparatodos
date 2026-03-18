import React from 'react'

const DataRow2: React.FC<{ label: string; value: React.ReactNode; strong?: boolean; valueClass?: string }> = ({
    label,
    value,
    strong,
    valueClass,
}) => (
    <div className="flex items-center justify-between bg-success/70 text-white px-3 py-2 rounded-md">
        <span className="font-medium">{label}</span>
        <span className={strong ? 'font-bold' : valueClass || ''}>{value}</span>
    </div>
);
export default DataRow2