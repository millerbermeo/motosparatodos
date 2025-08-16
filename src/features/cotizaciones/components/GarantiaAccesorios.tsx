import React from "react";
import type { UseFormRegister, Control } from "react-hook-form";
import type { FormValues } from "../types";
import { FormInput } from "../../../shared/components/FormInput";
import { numberParser } from "../utils";

export const GarantiaAccesorios: React.FC<{
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
}> = ({ register, control }) => (
  <>
    <div>
      <div className="relative bg-base-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
        <label className="absolute left-3 top-2 text-xs text-base-content/60">Garantía extendida</label>
        <select className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-lg" {...register("garantiaExtendida")}>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
      </div>
    </div>

    <FormInput<FormValues>
      name="accesoriosValor"
      label="Accesorios / Marcadas / Personalizadas"
      control={control}
      rules={{ setValueAs: numberParser }}
    />
  </>
);
