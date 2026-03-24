import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
};

const InputFilter: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
}) => {
  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text text-xs font-semibold text-base-content/70">
          {label}
        </span>
      </label>

      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            {icon}
          </span>
        )}

        <input
          className={`input input-bordered w-full rounded-xl bg-base-100 ${
            icon ? "pl-9" : ""
          }`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputFilter;