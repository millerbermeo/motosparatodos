import React from "react";

type Option = {
  label: string;
  value: string | number;
};

type Props = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Option[];
};

const SelectFilter: React.FC<Props> = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text text-xs font-semibold text-base-content/70">
          {label}
        </span>
      </label>

      <select
        className="select select-bordered w-full rounded-xl bg-base-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectFilter;