// SelectEmpresas.tsx
import { useId, useState } from "react";
import { useEmpresas } from "../../services/empresasServices";

// Solo estas empresas se muestran
const EMPRESAS_PERMITIDAS = [3, 4];
const DEFAULT_ID = 3; // MOTO PARA TODOS

type SelectEmpresasProps = {
  label?: string;
  value?: number;
  /** Empresa seleccionada por defecto. Default: MOTO PARA TODOS (id 3) */
  defaultValue?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (id: number, nombre: string) => void;
};

export function SelectEmpresas({
  label = "Empresa",
  value,
  defaultValue = DEFAULT_ID,
  disabled,
  className = "",
  onChange,
}: SelectEmpresasProps) {
  const id = useId();
  const { data: empresas = [], isLoading } = useEmpresas();

  const opciones = empresas.filter((e) =>
    EMPRESAS_PERMITIDAS.includes(Number(e.id))
  );

  const isControlled = value != null;
  const [internal, setInternal] = useState<number>(defaultValue);
  const selected = isControlled ? value! : internal;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    const empresa = opciones.find((x) => Number(x.id) === next);
    if (!isControlled) setInternal(next);
    onChange?.(next, empresa?.nombre_empresa ?? "");
  };

  return (
    <div className={["w-full", className].join(" ")}>
      <label
        htmlFor={id}
        className="block mb-1 text-sm font-medium text-base-content/80"
      >
        {label}
      </label>

      <select
        id={id}
        className="select select-bordered w-full bg-base-200"
        value={selected}
        disabled={disabled || isLoading}
        onChange={handleChange}
      >
        {isLoading && <option>Cargando…</option>}
        {opciones.map((emp) => (
          <option key={emp.id} value={Number(emp.id)}>
            {emp.nombre_empresa}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectEmpresas;
