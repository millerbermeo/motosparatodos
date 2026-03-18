import React from 'react'

const InfoPill: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
    icon,
    label,
    value,
}) => (
    <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
        <span className="opacity-80">{icon}</span>
        <div>
            <div className="text-xs opacity-60">{label}</div>
            <div className="text-sm font-medium">{value}</div>
        </div>
    </div>
);

export default InfoPill