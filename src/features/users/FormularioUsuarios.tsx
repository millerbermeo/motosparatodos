// src/components/usuarios/FormularioUsuarios.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { FormInput } from "../../shared/components/FormInput";
import RolesSelect from "./RolesSelect";
import { useRegisterUsuario, useUpdateUsuario } from "../../services/usersServices";

type FormValues = {
  id?: string;              // oculto en UI; solo para edición
  name: string;
  lastname: string;
  username: string;
  pass: string;
  confirmPassword: string;  // solo front
  phone: string;
  rol: string;              // value = Roles.rol
  state: 0 | 1;             // numérico
  cedula: string;
  fecha_exp: string;        // YYYY-MM-DD (o "")
};

type Props = {
  initialValues?: Partial<FormValues>;
  mode?: "create" | "edit";
};

const FormularioUsuarios: React.FC<Props> = ({ initialValues, mode = "create" }) => {
  const { mutate: createUser, isPending: isCreating } = useRegisterUsuario();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUsuario();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      id: initialValues?.id ? String(initialValues.id) : "",
      name: initialValues?.name ?? "",
      lastname: initialValues?.lastname ?? "",
      username: initialValues?.username ?? "",
      pass: "",
      confirmPassword: "",
      phone: initialValues?.phone ?? "",
      rol: (initialValues?.rol as string) ?? "",
      state:
        typeof initialValues?.state === "string"
          ? (Number(initialValues?.state) as 0 | 1)
          : (initialValues?.state ?? 1),
      cedula: initialValues?.cedula ?? "",
      fecha_exp:
        initialValues?.fecha_exp && initialValues.fecha_exp !== "0000-00-00"
          ? initialValues.fecha_exp
          : "",
    },
    mode: "onBlur",
  });

  // Rehidrata valores en cambios de props/mode (evita "pegados")
  React.useEffect(() => {
    reset({
      id: initialValues?.id ? String(initialValues.id) : "",
      name: initialValues?.name ?? "",
      lastname: initialValues?.lastname ?? "",
      username: initialValues?.username ?? "",
      pass: "",
      confirmPassword: "",
      phone: initialValues?.phone ?? "",
      rol: (initialValues?.rol as string) ?? "",
      state:
        typeof initialValues?.state === "string"
          ? (Number(initialValues?.state) as 0 | 1)
          : (initialValues?.state ?? 1),
      cedula: initialValues?.cedula ?? "",
      fecha_exp:
        initialValues?.fecha_exp && initialValues.fecha_exp !== "0000-00-00"
          ? initialValues.fecha_exp
          : "",
    });
  }, [initialValues, mode, reset]);

  const pass = watch("pass");

  const onSubmit = (data: FormValues) => {
    const base = {
      name: data.name.trim(),
      lastname: data.lastname.trim(),
      username: data.username.trim(),
      phone: data.phone.trim(),
      rol: data.rol,
      state: Number(data.state) as 0 | 1,
      cedula: data.cedula.trim(),
      fecha_exp: data.fecha_exp ? data.fecha_exp : "0000-00-00",
    };

    if (mode === "edit") {
      const payload: any = {
        ...base,
        id: Number(data.id), // viene oculto del initialValues
      };
      // Solo enviar pass si el usuario la cambió
      if (data.pass && data.pass.trim().length > 0) {
        payload.pass = data.pass;
      }
      updateUser(payload);
    } else {
      const payload: any = {
        ...base,
        pass: data.pass, // en create es obligatoria
      };
      createUser(payload);
    }
  };

  const busy = isSubmitting || isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {/* ID oculto (solo para edición) */}
      {mode === "edit" && (
        <input type="hidden" {...register("id")} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <FormInput<FormValues>
          name="name"
          label="Nombre"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
        />

        <FormInput<FormValues>
          name="lastname"
          label="Apellido"
          control={control}
          rules={{ required: "El apellido es obligatorio" }}
        />

        <FormInput<FormValues>
          name="username"
          label="Usuario"
          control={control}
          rules={{
            required: "El usuario es obligatorio",
            minLength: { value: 3, message: "Mínimo 3 caracteres" },
          }}
        />

        <FormInput<FormValues>
          name="phone"
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
          <div className="relative bg-base-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
            <label className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none">
              Fecha de expedición
            </label>
            <input
              type="date"
              className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
              {...register("fecha_exp")}
            />
          </div>
          {errors.fecha_exp && (
            <p className="mt-1 text-sm text-error">
              {errors.fecha_exp.message as string}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <FormInput<FormValues>
          name="pass"
          label="Contraseña"
          type="password"
          control={control}
          rules={
            mode === "create"
              ? {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                }
              : {
                  // En edición se puede dejar vacía si no se desea cambiar
                  minLength: { value: 3, message: "Mínimo 3 caracteres" },
                }
          }
        />

        {/* Confirmar contraseña */}
        <FormInput<FormValues>
          name="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          control={control}
          rules={
            mode === "create"
              ? {
                  required: "Debes confirmar la contraseña",
                  validate: (v) => v === pass || "Las contraseñas no coinciden",
                }
              : {
                  validate: (v) =>
                    v === pass || v === "" || "Las contraseñas no coinciden",
                }
          }
        />

        {/* Rol (usa RolesSelect que maneja RHF) */}
        <RolesSelect
          control={control}
          name="rol"
          label="Rol"
          requiredMessage="El rol es obligatorio"
          placeholder="-- Selecciona --"
          className="rounded-2xl"
        />

        {/* Estado 0/1 */}
        <div className="w-full">
          <div className="relative bg-base-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/40 transition-[box-shadow,ring] duration-150">
            <label className="absolute left-3 top-2 text-xs text-base-content/60 pointer-events-none select-none">
              Estado
            </label>
            <select
              className="w-full bg-transparent outline-none border-none px-3 pt-6 pb-2 text-base rounded-2xl"
              {...register("state", {
                required: "El estado es obligatorio",
                setValueAs: (v) => Number(v) as 0 | 1,
              })}
              defaultValue={1}
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          {errors.state && (
            <p className="mt-1 text-sm text-error">
              {errors.state.message as string}
            </p>
          )}
        </div>

        {/* Botón */}
        <div className="md:col-span-2 pt-2">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={busy}
          >
            {busy
              ? mode === "edit"
                ? "Actualizando..."
                : "Guardando..."
              : mode === "edit"
                ? "Actualizar usuario"
                : "Crear usuario"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioUsuarios;
