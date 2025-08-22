import React from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { FormInput } from "../../shared/components/FormInput";
import { useUsuarioById, useUpdateUsuario } from "../../services/usersServices";
import type { Usuario } from "../../shared/types/users";

interface Props { id: number; }
type ApiResponse = { usuarios?: Usuario[] };

type FormValues = {
  name: string;
  lastname: string;
  cedula: string;
  username: string;
  pass?: string; // ← ahora es `pass`
};

const UserPerfil: React.FC<Props> = ({ id }) => {
  const { data, isPending, isError } = useUsuarioById(String(id));
  const res = (data as ApiResponse | undefined);
  const u = res?.usuarios?.[0];
  const update = useUpdateUsuario();

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      lastname: "",
      cedula: "",
      username: "",
      pass: "" // nunca se prellena desde el backend
    },
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "firstError"
  });

  // Rehidrata cuando llega el usuario (pero NO la contraseña)
  React.useEffect(() => {
    if (u) {
      reset({
        name: u.name ?? "",
        lastname: u.lastname ?? "",
        // @ts-ignore — si tu tipo no tiene estos campos
        cedula: (u as any).cedula ?? "",
        username: (u as any).username ?? "",
        pass: ""
      });
      setFocus("name");
    }
  }, [u, reset, setFocus]);

  const [showPass, setShowPass] = React.useState(false);
  const busy = isSubmitting || update.isPending;
  const passValue = watch("pass") ?? "";

  const onSubmit = (values: FormValues) => {
    if (!u) return;

    const payloadBase: Usuario = {
      ...u,
      name: values.name.trim(),
      lastname: values.lastname.trim(),
      // @ts-ignore — si no está en tu tipo
      cedula: values.cedula.trim(),
      // @ts-ignore — si no está en tu tipo
      username: values.username.trim()
    };

    // Solo incluimos pass si el usuario escribió algo
    const payload: Usuario & { pass?: string } = {
      ...payloadBase,
      ...(values.pass?.trim()
        ? { pass: values.pass.trim() }
        : {})
    };

    update.mutate(payload, {
      onSuccess: () => {
        // Limpia el campo después de actualizar
        setValue("pass", "");
      }
    });
  };

  if (isPending) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl p-6 animate-pulse space-y-4">
        <div className="h-4 w-40 bg-base-200 rounded" />
        <div className="h-3 w-full bg-base-200 rounded" />
        <div className="h-3 w-3/4 bg-base-200 rounded" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-warning">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm">No se pudo cargar el usuario.</span>
      </div>
    );
  }

  if (!u) {
    return <div className="alert"><span>No se encontró el usuario.</span></div>;
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-white">
      <div className="p-6 border-b border-base-300">
        <h3 className="text-lg font-semibold">Editar usuario #{u.id}</h3>
        <p className="text-sm opacity-70">
          Nombre, apellido, cédula, usuario y (opcional) contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput<FormValues>
          name="name"
          label="Nombre"
          control={control}
          placeholder="Nombre"
          disabled={busy}
          rules={{
            required: "El nombre es obligatorio",
            minLength: { value: 2, message: "Mínimo 2 caracteres" }
          }}
        />

        <FormInput<FormValues>
          name="lastname"
          label="Apellido"
          control={control}
          placeholder="Apellido"
          disabled={busy}
          rules={{
            required: "El apellido es obligatorio",
            minLength: { value: 2, message: "Mínimo 2 caracteres" }
          }}
        />

        <FormInput<FormValues>
          name="cedula"
          label="Cédula"
          control={control}
          placeholder="Cédula"
          disabled={busy}
          rules={{ required: "La cédula es obligatoria" }}
        />

        <FormInput<FormValues>
          name="username"
          label="Usuario"
          control={control}
          placeholder="Usuario"
          disabled={busy}
          rules={{ required: "El usuario es obligatorio" }}
        />

        {/* Campo pass con ojito */}
        <div className="md:col-span-2 relative">
          <FormInput<FormValues>
            name="pass"
            label="Contraseña (opcional)"
            control={control}
            placeholder="Nueva contraseña"
            type={showPass ? "text" : "password"}
            disabled={busy}
            className="pr-10"
            rules={{
              validate: (v) => {
                if (!v) return true;
                if (v.length < 6) return "Mínimo 6 caracteres";
                return true;
              }
            }}
          />

          <button
            type="button"
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="btn btn-ghost btn-xs absolute right-2 top-[38px] md:top-[42px]"
            onClick={() => setShowPass((s) => !s)}
            disabled={busy}
            tabIndex={-1}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {!passValue && (
            <p className="text-xs text-base-content/60 mt-1">
              Deja en blanco para no cambiar la contraseña.
            </p>
          )}
        </div>

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="submit"
            className={`btn btn-primary ${busy ? "btn-disabled" : ""}`}
            disabled={busy}
          >
            {busy ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserPerfil;
