import React from 'react'

const StatTile: React.FC<{ label: string; value: string; badge?: string }> = ({ label, value, badge }) => (
  <div className="stats shadow-sm bg-base-200 w-full rounded-xl">
    <div className="stat">
      <div className="stat-title">{label}</div>
      <div className="stat-value text-lg">{value}</div>
      {badge && (
        <div className="stat-desc">
          <span className="badge badge-ghost">{badge}</span>
        </div>
      )}
    </div>
  </div>
);

export default StatTile