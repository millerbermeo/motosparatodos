import React from "react";
import { useUsuarioById } from "../../services/usersServices";
import { BadgeCheck, Phone, Shield, User as UserIcon, IdCard, AlertTriangle } from "lucide-react";
import type { Usuario } from "../../shared/types/users";

interface Props {
  id: number;
}

// -------- Helpers --------
const isEmpty = (v: unknown) => v === null || v === undefined || v === "";

// Devuelve el real si existe, si no el demo
const withDemo = <T,>(real: T | undefined | null, demo: T) =>
  (isEmpty(real) ? demo : (real as T));

// Formatos básicos
const formatFecha = (f?: string) => (!f || f === "0000-00-00" ? "—" : f);
const safe = (v?: string | number | null) => (isEmpty(v) ? "—" : v);

// Badges
const estadoBadge = (s: 0 | 1) => (
  <span className={`badge ${s === 1 ? "badge-success" : "badge-error"} gap-1`}>
    <BadgeCheck className="w-3 h-3" />
    {s === 1 ? "Activo" : "Inactivo"}
  </span>
);

const rolBadge = (rol: unknown) => (
  <span className="badge badge-ghost">{safe(String(rol ?? "—"))}</span>
);

// Avatar
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

// -------- Datos de ejemplo (realistas) --------
const demoUser = {
  id: 1023,
  name: "Germán",
  lastname: "Muñoz",
  username: "gmunoz",
  rol: "Asesor comercial",
  state: 1 as 0 | 1,
  cedula: "1.144.102.233",
  fecha_exp: "2012-08-08",
  phone: "3115380028",
};

const UserPerfil: React.FC<Props> = ({ id }) => {
  const { data, isPending, isError } = useUsuarioById(String(id));
  const u = data as unknown as Usuario | undefined;

  // Mientras carga
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

  // Si no hay datos o hubo error, usaremos demo
  const usingDemo = isError || !u;

  // Campos con fallback demo campo-a-campo
  const name = withDemo(u?.name, demoUser.name);
  const lastname = withDemo(u?.lastname, demoUser.lastname);
  const username = withDemo((u as any)?.username, demoUser.username);
  const rol = withDemo((u as any)?.rol, demoUser.rol);
  const state = withDemo((u as any)?.state, demoUser.state) as 0 | 1;
  const cedula = withDemo((u as any)?.cedula, demoUser.cedula);
  const fecha_exp = withDemo((u as any)?.fecha_exp, demoUser.fecha_exp);
  const phone = withDemo((u as any)?.phone, demoUser.phone);
  const internalId = withDemo((u as any)?.id, demoUser.id);

  return (
    <div className="rounded-2xl border border-base-300 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between gap-4 border-b border-base-300 bg-gradient-to-r from-base-100 to-white">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar nombre={name} lastname={lastname} />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight truncate">
              {safe(`${name} ${lastname}`)}
            </h3>
            <div className="flex items-center gap-2 flex-wrap text-sm text-base-content/70">
              <UserIcon className="w-4 h-4" />
              <span>@{safe(username)}</span>
              <span className="mx-1">•</span>
              <Shield className="w-4 h-4" />
              {rolBadge(rol)}
              <span className="mx-1">•</span>
              {estadoBadge(state)}
            </div>
          </div>
        </div>

        {/* Badges pequeños */}
        <div className="flex items-center gap-2">
          <span className="badge badge-ghost badge-xs">En desarrollo</span>
          {usingDemo && (
            <span className="badge badge-info badge-xs">Mostrando datos de ejemplo</span>
          )}
        </div>
      </div>

      {/* Aviso si falló la carga */}
      {isError && (
        <div className="px-6 pt-4">
          <div className="alert alert-warning">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">
              No se pudo cargar el usuario. Se muestran valores de ejemplo.
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <span className="text-xs uppercase tracking-wider text-base-content/60">
              Identificación
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">Cédula:</span>
              <span>{safe(cedula)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">Fecha exp.:</span>
              <span>{formatFecha(fecha_exp)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <IdCard className="w-4 h-4" />
              <span className="font-medium">ID interno:</span>
              <span>{safe(internalId)}</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-4">
            <span className="text-xs uppercase tracking-wider text-base-content/60">
              Contacto
            </span>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="font-medium">Teléfono:</span>
              <span>{safe(phone)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserPerfil;
