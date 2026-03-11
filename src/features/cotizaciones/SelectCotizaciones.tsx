import React, { useMemo, useState } from "react";
import Select, {
  type SingleValue,
  type InputActionMeta,
} from "react-select";

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
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const searchTerm = inputValue.trim();
  const shouldSearch = searchTerm.length >= MIN_CHARS;

  const { data: personas = [], isLoading } = useBuscarPersonas(
    shouldSearch ? searchTerm : ""
  );

  const options = useMemo<Option[]>(() => {
    if (!shouldSearch) return [];

    return personas.map((p) => {
      const nombre = p.name?.trim() || "—";
      const doc = p.cedula?.trim() || "";

      return {
        value: Number(p.id),
        label: doc ? `${nombre} - ${doc}` : nombre,
        data: p,
      };
    });
  }, [personas, shouldSearch]);

  const handleChange = (opt: SingleValue<Option>) => {
    setSelectedOption(opt ?? null);

    if (!opt) {
      setInputValue("");
      onSelect(null);
      return;
    }

    // limpiar el texto buscado para que se vea el label seleccionado
    setInputValue("");
    onSelect(opt.value);
  };

  const handleInputChange = (newValue: string, meta: InputActionMeta) => {
    if (meta.action === "input-change") {
      setInputValue(newValue);
    }

    return newValue;
  };

  return (
    <Select<Option, false>
      className="min-w-72 max-w-96 w-full"
      classNamePrefix="react-select"
      value={selectedOption}
      inputValue={inputValue}
      options={options}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isClearable
      isLoading={isLoading}
      placeholder="Buscar persona..."
      filterOption={() => true}
      menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
      }}
      noOptionsMessage={() =>
        inputValue.trim().length < MIN_CHARS
          ? `Escribe al menos ${MIN_CHARS} caracteres`
          : isLoading
          ? "Buscando..."
          : "Sin resultados"
      }
    />
  );
};

export default SelectCotizaciones;