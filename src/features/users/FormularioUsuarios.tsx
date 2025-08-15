// FormularioUsuarios.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";

type FormValues = {
  cedula: string;
  fechaExpedicion: string;
  nombre: string;
  apellido: string;
  username: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  rol: "admin" | "operador" | "invitado" | "";
};

const roles: Array<{ value: FormValues["rol"]; label: string }> = [
  { value: "", label: "Seleccione un rol" },
  { value: "admin", label: "Administrador" },
  { value: "operador", label: "Operador" },
  { value: "invitado", label: "Invitado" },
];

const FormularioUsuarios: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      cedula: "",
      fechaExpedicion: "",
      nombre: "",
      apellido: "",
      username: "",
      password: "",
      confirmPassword: "",
      telefono: "",
      rol: "",
    },
  });

  const password = watch("password");

  const onSubmit = (data: FormValues) => {
    console.log("payload:", data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-4"
    >
      {/* GRID: 1 col en móvil / 2 cols en md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Cédula */}
        <FormInput<FormValues>
          name="cedula"
          label="Cédula"
          control={control}
          type="text"
          rules={{
            required: "La cédula es obligatoria",
            pattern: {
              value: /^[0-9.-]{5,20}$/,
              message: "Solo números (puede incluir . o -)",
            },
          }}
        />

        {/* Fecha de expedición */}
        <div className="w-full">
          <div
            className={[
              "relative bg-base-200 rounded-2xl shadow-sm",
              "focus-within:ring-2 focus-within:ring-primary/40",
              "transition-[box-shadow,ring] duration-150",
            ].join(" ")}
          >
            <label className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none">
              Fecha de expedición <span className="text-error">*</span>
            </label>
            <input
              type="date"
              className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
              {...register("fechaExpedicion", {
                required: "La fecha es obligatoria",
              })}
            />
          </div>
          {errors.fechaExpedicion && (
            <p className="mt-1 text-sm text-error">
              {errors.fechaExpedicion.message}
            </p>
          )}
        </div>

        {/* Nombre */}
        <FormInput<FormValues>
          name="nombre"
          label="Nombre"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
        />

        {/* Apellido */}
        <FormInput<FormValues>
          name="apellido"
          label="Apellido"
          control={control}
          rules={{ required: "El apellido es obligatorio" }}
        />

        {/* Nombre de usuario */}
        <FormInput<FormValues>
          name="username"
          label="Nombre de usuario"
          control={control}
          rules={{
            required: "El nombre de usuario es obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          }}
        />

        {/* Teléfono */}
        <FormInput<FormValues>
          name="telefono"
          label="Teléfono"
          type="tel"
          control={control}
          rules={{
            required: "El teléfono es obligatorio",
            pattern: {
              value: /^[0-9 +()-]{7,20}$/,
              message: "Teléfono no válido",
            },
          }}
        />

        {/* Contraseña */}
        <FormInput<FormValues>
          name="password"
          label="Contraseña"
          type="password"
          control={control}
          rules={{
            required: "La contraseña es obligatoria",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          }}
        />

        {/* Confirmar contraseña */}
        <FormInput<FormValues>
          name="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          control={control}
          rules={{
            required: "Debes confirmar la contraseña",
            validate: (v) => v === password || "Las contraseñas no coinciden",
          }}
        />

        {/* Rol (Select) */}
        <Controller
          control={control}
          name="rol"
          rules={{ required: "El rol es obligatorio" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <div
                className={[
                  "relative bg-base-200 rounded-2xl shadow-sm",
                  "focus-within:ring-2 focus-within:ring-primary/40",
                  "transition-[box-shadow,ring] duration-150",
                ].join(" ")}
              >
                <label className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none">
                  Rol <span className="text-error">*</span>
                </label>
                <select
                  className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
                  {...field}
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {fieldState.error?.message && (
                <p className="mt-1 text-sm text-error">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Botón: ocupa todo el ancho de la grid */}
        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioUsuarios;
