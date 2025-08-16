import React from "react";
import { fmtCOP } from "../utils";

export const ResumenValores: React.FC<{
  matriculaSoat: number;
  descuentos: number;
  accesoriosValor: number;
  totalSinSeguros: number;
  totalConSeguros: number;
}> = ({ matriculaSoat, descuentos, accesoriosValor, totalSinSeguros, totalConSeguros }) => (
  <div className="md:col-span-2 space-y-2">
    <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">Matrícula y SOAT: <strong>{fmtCOP(matriculaSoat || 0)}</strong></div>
    <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">Descuentos: <strong>{fmtCOP(descuentos || 0)}</strong></div>
    <div className="bg-sky-100 rounded-lg px-3 py-2 text-sm">Accesorios / Marcadas / Personalizadas: <strong>{fmtCOP(accesoriosValor || 0)}</strong></div>
    <div className="bg-emerald-100 rounded-lg px-3 py-2 text-sm font-semibold">TOTAL SIN SEGUROS: <strong>{fmtCOP(totalSinSeguros)}</strong></div>
    <div className="bg-emerald-100 rounded-lg px-3 py-2 text-sm font-semibold">TOTAL CON SEGUROS: <strong>{fmtCOP(totalConSeguros)}</strong></div>
  </div>
);
