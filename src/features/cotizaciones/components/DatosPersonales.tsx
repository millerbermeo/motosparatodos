import React from "react";
import type { Control, FieldErrors } from "react-hook-form";
import type { FormValues } from "../types";
import { FormInput } from "../../../shared/components/FormInput";

export const DatosPersonales: React.FC<{
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}> = ({ control }) => (
  <>
    <FormInput<FormValues> name="cedula" label="Cédula" control={control} />
    <FormInput<FormValues> name="fechaNacimiento" label="Fecha de nacimiento" control={control} type="date" />
    <FormInput<FormValues> name="primerNombre" label="Primer nombre" control={control} rules={{ required: "El primer nombre es obligatorio" }} />
    <FormInput<FormValues> name="segundoNombre" label="Segundo nombre" control={control} />
    <FormInput<FormValues> name="primerApellido" label="Primer apellido" control={control} rules={{ required: "El primer apellido es obligatorio" }} />
    <FormInput<FormValues> name="segundoApellido" label="Segundo apellido" control={control} />
    <FormInput<FormValues>
      name="celular"
      label="Celular"
      control={control}
      type="tel"
      rules={{ required: "El celular es obligatorio", pattern: { value: /^[0-9 +()\-]{7,20}$/, message: "Teléfono no válido" } }}
    />
    <FormInput<FormValues>
      name="email"
      label="Email"
      control={control}
      type="email"
      rules={{ validate: (v: any) => !v || /\S+@\S+\.\S+/.test(v) || "Correo no válido" }}
    />
  </>
);
