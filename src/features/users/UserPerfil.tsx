import React from "react";
import { useUsuarioById, useUpdateUsuario } from "../../services/usersServices";
import { AlertTriangle } from "lucide-react";
import type { Usuario } from "../../shared/types/users";

interface Props { id: number; }
type ApiResponse = { usuarios?: Usuario[] };

const UserPerfil: React.FC<Props> = ({ id }) => {
  const { data, isPending, isError } = useUsuarioById(String(id));
  const res = (data as ApiResponse | undefined);
  const u = res?.usuarios?.[0]; // ← primer usuario
  const update = useUpdateUsuario();

  const [form, setForm] = React.useState({
    name: "",
    lastname: "",
    cedula: "",
    username: "",
  });

  React.useEffect(() => {
    if (u) {
      setForm({
        name: u.name ?? "",
        lastname: u.lastname ?? "",
        cedula: (u as any).cedula ?? "",
        username: (u as any).username ?? "",
      });
    }
  }, [u]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!u) return;
    // enviamos el usuario original con los campos editados
    const payload: Usuario = {
      ...u,
      name: form.name,
      lastname: form.lastname,
      // @ts-ignore — si tu tipo no tiene 'cedula'/'username' explícitos
      cedula: form.cedula,
      username: form.username,
    };
    update.mutate(payload);
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
        <p className="text-sm opacity-70">Solo nombre, apellido, cédula y usuario</p>
      </div>

      <form onSubmit={onSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="form-control">
          <span className="label"><span className="label-text">Nombre</span></span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="input input-bordered"
            placeholder="Nombre"
            disabled={update.isPending}
            required
          />
        </label>

        <label className="form-control">
          <span className="label"><span className="label-text">Apellido</span></span>
          <input
            name="lastname"
            value={form.lastname}
            onChange={onChange}
            className="input input-bordered"
            placeholder="Apellido"
            disabled={update.isPending}
            required
          />
        </label>

        <label className="form-control">
          <span className="label"><span className="label-text">Cédula</span></span>
          <input
            name="cedula"
            value={form.cedula}
            onChange={onChange}
            className="input input-bordered"
            placeholder="Cédula"
            disabled={update.isPending}
            required
          />
        </label>

        <label className="form-control">
          <span className="label"><span className="label-text">Usuario</span></span>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            className="input input-bordered"
            placeholder="Usuario"
            disabled={update.isPending}
            required
          />
        </label>

        {/* Botones */}
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button
            type="submit"
            className={`btn btn-primary ${update.isPending ? "btn-disabled" : ""}`}
            disabled={update.isPending}
          >
            {update.isPending ? "Guardando..." : "Actualizar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserPerfil;
