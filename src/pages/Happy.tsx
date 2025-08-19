// src/components/happy/Happy.tsx
import React from "react";
import {
  PartyPopper,
  Gift,
  Hammer,
  Calendar,
  Send,

  MessageSquare,
} from "lucide-react";

const Happy: React.FC = () => {
  return (
    <main className="w-full">
      {/* HERO */}
      <section className="relative w-full bg-gradient-to-r from-fuchsia-700 via-violet-600 to-indigo-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="badge badge-outline border-white/60 text-white/90 mb-3">
                Módulo en desarrollo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
                <PartyPopper className="w-8 h-8" />
                Celebraciones y Cumpleaños
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Administra cumpleaños
              </p>
            </div>

            {/* Tarjeta de estado */}
            <div className="shrink-0">
              <div className="stats shadow bg-white/10 backdrop-blur-sm text-white">
                <div className="stat">
                  <div className="stat-title text-white/80">Estado</div>
                  <div className="stat-value text-white">En desarrollo</div>
                  <div className="stat-desc text-white/80">
                    Integraciones de mensajería pronto
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ribbon */}
          <div className="pointer-events-none select-none absolute -right-14 top-6 rotate-45 bg-black/20 px-16 py-2 text-sm font-semibold tracking-wide">
            EN DESARROLLO
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 hidden">
        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon={<Send className="w-5 h-5" />}
            title="Enviar saludo"
            desc="Redacta y envía un saludo personalizado."
            disabled
          />
          <ActionCard
            icon={<Calendar className="w-5 h-5" />}
            title="Programar recordatorio"
            desc="Configura avisos automáticos antes de la fecha."
            disabled
          />
          <ActionCard
            icon={<Gift className="w-5 h-5" />}
            title="Registrar regalo"
            desc="Lleva control de obsequios y entregas."
            disabled
          />
        </div>

        {/* KPIs / Métricas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Metric title="Cumpleaños hoy" value="—" hint="Disponible pronto" />
          <Metric title="Esta semana" value="—" hint="Disponible pronto" />
          <Metric title="Saludos enviados (mes)" value="—" hint="Disponible pronto" />
        </div>

        {/* Formulario rápido */}
        <div className="mt-8 card bg-base-100 shadow hidden">
          <div className="card-body">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="card-title">Programar saludo</h2>
                <p className="text-base-content/70">
                  Captura los datos para agendar el envío del mensaje.
                  (Módulo en desarrollo)
                </p>
              </div>
              <span className="badge badge-warning badge-outline">Próximamente</span>
            </div>

            <div className="relative">
              {/* Overlay bloqueo */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-base-200/40 backdrop-blur-[1px]" />

              <form
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-90"
                aria-disabled
              >
                <Field label="Nombre destinatario" placeholder="Nombre completo" />
                <Field label="Fecha de cumpleaños" type="date" />
                <Field
                  label="Canal de envío"
                  as="select"
                  options={["Email", "WhatsApp", "SMS"]}
                />
                <Field
                  label="Email"
                  placeholder="destinatario@correo.com"
                  type="email"
                />
                <Field
                  label="Celular (WhatsApp/SMS)"
                  placeholder="3XXXXXXXXX"
                  type="tel"
                />
                <Field
                  label="Fecha / hora de envío"
                  type="datetime-local"
                  placeholder=""
                />
                <Field
                  label="Mensaje"
                  placeholder="¡Feliz cumpleaños! Te deseamos un año increíble 🎉"
                />
              </form>

              <div className="mt-4 flex items-center gap-3">
                <button className="btn btn-primary btn-disabled" disabled>
                  Guardar y programar
                </button>
                <span className="text-sm text-base-content/70">
                  Esta acción estará disponible en la próxima versión.
                </span>
              </div>
            </div>

            {/* Aviso de módulo en desarrollo */}
            <div className="alert alert-warning mt-6">
              <Hammer className="w-5 h-5" />
              <div>
                <h4 className="font-semibold">Módulo de cumpleaños en desarrollo</h4>
                <p className="text-sm">
                  En breve podrás automatizar recordatorios y enviar mensajes por
                  <span className="font-medium"> Email, WhatsApp o SMS</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla placeholder */}
        <div className="mt-8 card bg-base-100 shadow hidden">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Próximos cumpleaños
            </h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Canal</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="opacity-60">
                  <tr>
                    <td colSpan={4} className="text-center">
                      (Disponible próximamente)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Módulo de Celebraciones. En desarrollo.
        </div>
      </section>
    </main>
  );
};

/* ---------- Subcomponentes ---------- */

type ActionCardProps = {
  icon?: React.ReactNode;
  title: string;
  desc: string;
  disabled?: boolean;
};

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, desc, disabled }) => {
  return (
    <div className={`card shadow ${disabled ? "opacity-90" : ""}`}>
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2">
          {icon} {title}
        </h3>
        <p className="text-base-content/70">{desc}</p>
        <div className="card-actions justify-end mt-2">
          <button className="btn btn-primary btn-disabled" disabled>
            Abrir
          </button>
          <span className="badge badge-warning badge-outline">En desarrollo</span>
        </div>
      </div>
    </div>
  );
};

type FieldProps =
  | {
      label: string;
      placeholder?: string;
      type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
      as?: "input";
      options?: never;
    }
  | {
      label: string;
      placeholder?: string;
      type?: never;
      as: "select";
      options: string[];
    };

const Field: React.FC<FieldProps> = (props) => {
  return (
    <label className="form-control w-full">
      <span className="label">
        <span className="label-text">{props.label}</span>
      </span>
      {props.as === "select" ? (
        <select className="select select-bordered" disabled>
          <option value="">Selecciona una opción</option>
          {props.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={props.type ?? "text"}
          placeholder={props.placeholder}
          className="input input-bordered"
          disabled
        />
      )}
    </label>
  );
};

type MetricProps = {
  title: string;
  value: string;
  hint?: string;
};

const Metric: React.FC<MetricProps> = ({ title, value, hint }) => {
  return (
    <div className="stats shadow bg-base-100">
      <div className="stat">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {hint ? <div className="stat-desc">{hint}</div> : null}
      </div>
    </div>
  );
};

export default Happy;
