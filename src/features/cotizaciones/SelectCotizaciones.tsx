import React, { useState, useMemo } from "react";
import Select  from "react-select";
import type { SingleValue } from "react-select";

import { useBuscarPersonas } from "../../services/cotizacionesServices";
import type { Persona } from "../../services/cotizacionesServices";

interface Option {
  value: number;
  label: string;
  data: Persona;
}

interface Props {
  onSelect: (id: number | null) => void;
}

const MIN_CHARS = 2;

const SelectCotizaciones: React.FC<Props> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const { data: personas = [], isLoading } = useBuscarPersonas(inputValue);

  const options = useMemo<Option[]>(() => {
    if (inputValue.length < MIN_CHARS) return [];
    return personas.map((p) => {
      const nombre = p.name || "—";
      const doc = p.cedula || "";
      return {
        value: Number(p.id),
        label: `${nombre}${doc ? " - " + doc : ""}`,
        data: p,
      };
    });
  }, [personas, inputValue]);

  const handleChange = (opt: SingleValue<Option>) => {
    onSelect(opt ? opt.value : null);
  };

  return (
    <Select<Option, false>
      className="min-w-72 max-w-96 w-full z-20"
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      options={options}
      onChange={handleChange}
      onInputChange={(val) => {
        setInputValue(val);
        return val;
      }}
      isClearable
      isLoading={isLoading}
      placeholder="Buscar persona..."
      noOptionsMessage={() =>
        inputValue.length < MIN_CHARS
          ? `Escribe al menos ${MIN_CHARS} caracteres`
          : "Sin resultados"
      }
    />
  );
};

export default SelectCotizaciones;
