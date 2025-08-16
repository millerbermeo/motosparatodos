import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { FormValues } from "../types";
import { marcas, modelosPorMarca } from "../catalogs";
import { fmtCOP } from "../utils";

const Card: React.FC<React.PropsWithChildren<{ title: string; error?: string }>> = ({ title, error, children }) => (
  <div>
    <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
      <label className="absolute left-3 top-2 text-xs text-base-content/60">{title}</label>
      <div className="px-3 pt-6 pb-2">{children}</div>
    </div>
    {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
  </div>
);

export const MotocicletasSection: React.FC<{
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  precioMoto1: number;
  precioMoto2: number;
  moto1Marca: string;
  moto2Marca: string;
}> = ({ register, errors, precioMoto1, precioMoto2, moto1Marca, moto2Marca }) => {
  const modelos1 = modelosPorMarca[moto1Marca] || modelosPorMarca[""];
  const modelos2 = modelosPorMarca[moto2Marca] || modelosPorMarca[""];

  return (
    <>
      {/* Moto 1 */}
      <Card
        title="title"
        error={String(errors.moto1Marca?.message || errors.moto1Modelo?.message || "")}
      >
        <div className="grid grid-cols-2 gap-2">
          <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto1Marca", { required: "Seleccione la marca" })}>
            {marcas.map((m) => <option key={m} value={m}>{m || "Seleccione..."}</option>)}
          </select>
          <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto1Modelo", { required: "Seleccione el modelo" })}>
            {modelos1.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs opacity-70">Precio seleccionado: <strong>{fmtCOP(precioMoto1)}</strong></div>
      </Card>

      {/* Moto 2 */}
      <Card title="Motocicleta 2">
        <div className="grid grid-cols-2 gap-2">
          <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto2Marca")}>
            {marcas.map((m) => <option key={m} value={m}>{m || "Seleccione..."}</option>)}
          </select>
          <select className="bg-transparent outline-none rounded-lg border border-base-300 px-2 py-2" {...register("moto2Modelo")}>
            {modelos2.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs opacity-70">Precio seleccionado: <strong>{fmtCOP(precioMoto2)}</strong></div>
      </Card>
    </>
  );
};
