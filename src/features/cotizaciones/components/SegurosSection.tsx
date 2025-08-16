import React from "react";
import type {  Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import type { FormValues, SeguroKey } from "../types";
import { SEGUROS_CATALOGO } from "../catalogs";
import { fmtCOP, numberParser } from "../utils";
import { FormInput } from "../../../shared/components/FormInput";

export const SegurosSection: React.FC<{
  control: Control<FormValues>;
  totalSeguros: number;
}> = ({ control, totalSeguros }) => (
  <div className="md:col-span-2">
    <div className="rounded-xl border border-base-300 overflow-hidden">
      <div className="bg-sky-100 px-4 py-2 text-sm font-medium">Elige los seguros de la cotización</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>
          {(Object.keys(SEGUROS_CATALOGO) as SeguroKey[]).map((k) => (
            <label key={k} className="flex items-center gap-2 py-1">
              <Controller
                name={`seguros.${k}` as const}
                control={control}
                render={({ field }) => (
                  <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                )}
              />
              <span className="text-sm">
                {SEGUROS_CATALOGO[k].label} - {fmtCOP(SEGUROS_CATALOGO[k].valor)}
              </span>
            </label>
          ))}
        </div>

        <div>
          <FormInput<FormValues>
            name="otrosSeguros"
            label="Otros seguros"
            control={control}
            rules={{ setValueAs: numberParser }}
          />
          <div className="bg-emerald-100 text-emerald-800 rounded-lg mt-2 px-3 py-2 text-sm">
            Valor total de seguros: <strong>{fmtCOP(totalSeguros)}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
);
