// src/shared/components/datatable/RowActions.tsx
import React from "react";

export const RowActions: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex justify-end gap-2">{children}</div>;

export const RowActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  className?: string;
  hidden?: boolean;
}> = ({ icon, title, onClick, className, hidden }) => (
  <button
    type="button"
    className={`btn btn-sm bg-base-100 btn-circle ${hidden ? "hidden" : ""} ${
      className ?? ""
    }`}
    onClick={onClick}
    title={title}
    aria-label={title}
  >
    {icon}
  </button>
);
