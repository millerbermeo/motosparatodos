import React from "react";
import { useUsuarioById } from "../../services/usersServices";
import { BadgeCheck, Phone, Shield, User as UserIcon, IdCard } from "lucide-react";
import type { Usuario } from "../../shared/types/users";


interface Props {
  id: number;
}

const formatFecha = (f?: string) => (!f || f === "0000-00-00" ? "—" : f);
const safe = (v?: string | number | null) => (v === null || v === undefined || v === "" ? "—" : v);

const estadoBadge = (s: 0 | 1) => (
  <span className={`badge ${s === 1 ? "badge-success" : "badge-error"} gap-1`}>
    <BadgeCheck className="w-3 h-3" />
    {s === 1 ? "Activo" : "Inactivo"}
  </span>
);

const rolBadge = (rol: unknown) => (
  <span className="badge badge-ghost">{safe(String(rol ?? "—"))}</span>
);

const Avatar: React.FC<{ nombre?: string; lastname?: string }> = ({ nombre, lastname }) => {
  const initials = `${(nombre ?? "").charAt(0)}${(lastname ?? "").charAt(0)}`.toUpperCase() || "U";
  return (
    <div className="avatar placeholder">
      <div className="bg-primary text-primary-content w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold">
        {initials}
      </div>
    </div>
  );
};

const UserPerfil: React.FC<Props> = ({ id }) => {
  const { data, isPending, isError } = useUsuarioById(String(id));
  const u = data as unknown as Usuario | undefined;

  if (isPending) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl p-6 animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-base-200" />
          <div className="flex-1">
            <div className="h-4 w-40 bg-base-200 rounded mb-2" />
            <div className="h-3 w-24 bg-base-200 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-base-200 rounded" />
        <div className="h-3 w-3/4 bg-base-200 rounded" />
      </div>
    );
  }

  if (isError || !u) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl p-6 text-error">
        Error al cargar usuario
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b border-base-300 bg-gradient-to-r from-base-100 to-white">
        <Avatar nombre={u.name} lastname={u.lastname} />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight truncate">
            {safe(`${u.name} ${u.lastname}`)}
          </h3>
          <div className="flex items-center gap-2 flex-wrap text-sm text-base-content/70">
            <UserIcon className="w-4 h-4" />
            <span>@{safe(u.username)}</span>
            <span className="mx-1">•</span>
            <Shield className="w-4 h-4" />
            {rolBadge(u.rol)}
            <span className="mx-1">•</span>
            {estadoBadge(u.state)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <span className="text-xs uppercase tracking-wider text-base-content/60">Identificación</span>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">Cédula:</span>
              <span>{safe(u.cedula)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">Fecha exp.:</span>
              <span>{formatFecha(u.fecha_exp)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">ID interno:</span>
              <span>{safe(u.id)}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <span className="text-xs uppercase tracking-wider text-base-content/60">Contacto</span>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Teléfono:</span>
              <span>{safe(u.phone)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer opcional */}
      <div className="p-4 border-t border-base-300 flex items-center justify-end gap-2">
        <button className="btn btn-ghost">Cerrar</button>
        {/* si luego quieres editar desde aquí, puedes agregar un botón Editar */}
        {/* <button className="btn btn-primary">Editar</button> */}
      </div>
    </div>
  );
};

export default UserPerfil;
