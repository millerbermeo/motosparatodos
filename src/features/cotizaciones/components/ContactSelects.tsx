import React from "react";
import type { UseFormRegister } from "react-hook-form";
import type { FormValues } from "../types";
import { canales, categoriasRelacion } from "../catalogs";

const Box: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = "" }) => (
  <div className={`relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150 ${className}`}>
    {children}
  </div>
);

export const ContactSelects: React.FC<{ register: UseFormRegister<FormValues> }> = ({ register }) => (
  <>
    <div className="md:col-span-2">
      <Box>
        <label className="absolute left-3 top-2 text-xs text-base-content/60 select-none">Canal de contacto</label>
        <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("canalContacto")}>
          {canales.map((c) => (
            <option key={c} value={c}>{c || "Seleccione..."}</option>
          ))}
        </select>
      </Box>
    </div>

    <div className="md:col-span-2">
      <Box>
        <label className="absolute left-3 top-2 text-xs text-base-content/60 select-none">
          Pregunta al cliente: ¿Para ti cuál de estas categorías describe mejor su relación con las motos?
        </label>
        <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("categoriaRelacion")}>
          {categoriasRelacion.map((c) => (
            <option key={c} value={c}>{c || "Seleccione..."}</option>
          ))}
        </select>
      </Box>
    </div>
  </>
);
