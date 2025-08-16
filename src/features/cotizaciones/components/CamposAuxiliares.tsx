import React from "react";
import type { Control } from "react-hook-form";
import type { FormValues } from "../types";
import { FormInput } from "../../../shared/components/FormInput";
import { numberParser } from "../utils";

export const CamposAuxiliares: React.FC<{ control: Control<FormValues> }> = ({ control }) => (
  <>
    <FormInput<FormValues> name="matriculaSoat" label="Matrícula y SOAT" control={control} rules={{ setValueAs: numberParser }} />
    <FormInput<FormValues> name="descuentos" label="Descuentos" control={control} rules={{ setValueAs: numberParser }} />
  </>
);
