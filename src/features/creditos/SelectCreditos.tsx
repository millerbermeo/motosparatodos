import React, { useMemo, useState } from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";

import { useBuscarCreditos } from "../../services/creditosServices";
import type { Credito } from "../../services/creditosServices";

interface Option {
  value: number;
  label: string;
  data: Credito;
}

interface Props {
  onSelect: (id: number | null) => void;
}

const MIN_CHARS = 2;

const SelectCreditos: React.FC<Props> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const { data: creditos = [], isLoading } = useBuscarCreditos(inputValue);

  const options = useMemo<Option[]>(() => {
    if (inputValue.length < MIN_CHARS) return [];
    return creditos.map((c) => ({
      value: Number(c.id),
      label: c.nombre_cliente || "—",
      data: c,
    }));
  }, [creditos, inputValue]);

  const handleChange = (opt: SingleValue<Option>) => {
    onSelect(opt ? opt.value : null);
  };

  return (
    <Select<Option, false>
      className="min-w-72 max-w-96 w-full z-20"
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      options={options}
      onChange={handleChange}
      onInputChange={(val) => {
        setInputValue(val);
        return val;
      }}
      isClearable
      isLoading={isLoading}
      placeholder="Buscar crédito por cliente..."
      noOptionsMessage={() =>
        inputValue.length < MIN_CHARS
          ? `Escribe al menos ${MIN_CHARS} caracteres`
          : "Sin resultados"
      }
    />
  );
};

export default SelectCreditos;
