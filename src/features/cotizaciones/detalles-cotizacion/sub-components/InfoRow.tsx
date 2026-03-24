import React from 'react'

const InfoRow: React.FC<{ label: string; value: React.ReactNode; full?: boolean }> = ({ label, value, full }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <div className="text-sm opacity-70">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

export default InfoRow


