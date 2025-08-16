import React from "react";
import type { Control } from "react-hook-form";
import type { FormValues } from "../types";
import { FormInput } from "../../../shared/components/FormInput";

export const Comentario: React.FC<{ control: Control<FormValues> }> = ({ control }) => (
  <FormInput<FormValues> name="comentario" label="Comentario" control={control} rules={{ required: "El comentario es obligatorio" }} />
);
