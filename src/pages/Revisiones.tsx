// src/components/revisiones/Revisiones.tsx
import React from "react";

const Revisiones: React.FC = () => {
  return (
    <main className="w-full">
      {/* HERO */}
      <section className="relative w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="badge badge-outline border-white/60 text-white/90 mb-3">
                Módulo en desarrollo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                Gestión de Revisiones y Mantenimiento — Motocicletas
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Agenda, controla y documenta mantenimientos preventivos y
                correctivos. Próximamente podrás crear órdenes de trabajo,
                gestionar repuestos y ver el historial por placa.
              </p>
            </div>

            {/* Resumen / estado */}
            <div className="shrink-0">
              <div className="stats shadow bg-white/10 backdrop-blur-sm text-white">
                <div className="stat">
                  <div className="stat-title text-white/80">Estado</div>
                  <div className="stat-value text-white">En desarrollo</div>
                  <div className="stat-desc text-white/80">
                    Integraciones y agenda próximamente
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
            title="Programar revisión"
            desc="Agenda una revisión preventiva y asigna técnico."
            disabled
          />
          <ActionCard
            title="Crear orden de trabajo"
            desc="Abre un OT con mano de obra, repuestos y notas."
            disabled
          />
          <ActionCard
            title="Historial por placa"
            desc="Consulta trabajos realizados y próximas alertas."
            disabled
          />
        </div>

        {/* KPIs / Métricas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Metric title="Revisiones próximas (30 días)" value="—" hint="Disponible pronto" />
          <Metric title="Revisiones atrasadas" value="—" hint="Disponible pronto" />
          <Metric title="Órdenes abiertas" value="—" hint="Disponible pronto" />
        </div>

        {/* Formulario rápido */}
        <div className="mt-8 card bg-base-100 shadow hidden">
          <div className="card-body">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="card-title">Programar revisión rápida</h2>
                <p className="text-base-content/70">
                  Registra los datos básicos para agendar un mantenimiento.
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
                <Field label="Placa" placeholder="ABC12D" />
                <Field
                  label="Tipo de servicio"
                  as="select"
                  options={["Preventivo", "Correctivo", "Diagnóstico"]}
                />
                <Field label="Kilometraje actual" placeholder="25.000" type="number" />
                <Field label="Fecha deseada" type="date" />
                <Field
                  label="Técnico (asignación)"
                  as="select"
                  options={["Sin asignar", "Técnico A", "Técnico B"]}
                />
                <Field
                  label="Contacto cliente (celular)"
                  placeholder="3XXXXXXXXX"
                  type="tel"
                />
                <Field label="Email cliente" placeholder="cliente@dominio.com" type="email" />
                <Field
                  label="Observaciones"
                  placeholder="Ruidos, vibraciones, cambios recientes..."
                />
              </form>

              <div className="mt-4 flex items-center gap-3">
                <button className="btn btn-primary btn-disabled" disabled>
                  Programar
                </button>
                <span className="text-sm text-base-content/70">
                  Esta acción estará disponible en la siguiente versión.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan sugerido + Estado módulo */}
        <div className="mt-8  grid-cols-1 lg:grid-cols-3 gap-6 hidden">
          <div className="lg:col-span-2 card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Plan de mantenimiento sugerido</h3>
              <ul className="mt-2 list-disc pl-5 text-base-content/80 space-y-1">
                <li>Cambio de aceite: cada 3.000–5.000 km.</li>
                <li>Ajuste y lubricación de cadena: cada 1.000 km o antes si llueve.</li>
                <li>Revisión de frenos (pastillas/guayas): mensual.</li>
                <li>Filtro de aire: limpieza cada 3.000 km / cambio según uso.</li>
                <li>Revisión eléctrica y luces: trimestral.</li>
                <li>Presión de llantas y desgaste: semanal.</li>
              </ul>

              <div className="alert mt-4">
                <span className="text-sm">
                  Nota: Las frecuencias pueden variar por fabricante y condiciones de uso.
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Estado del módulo</h3>
              <div className="space-y-2 text-sm text-base-content/80">
                <p>• Diseño UI/UX: Completado ✅</p>
                <p>• Agenda y calendario: En progreso ⏳</p>
                <p>• Órdenes de trabajo y repuestos: Pendiente 📦</p>
                <p>• Historial por placa: Pendiente 🗂️</p>
                <p>• Notificaciones (WhatsApp/Email): Pendiente 🔔</p>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline btn-sm" disabled>
                  Dejar feedback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla placeholder */}
        <div className="mt-8 card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Revisiones recientes</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Servicio</th>
                    <th>Kilometraje</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="opacity-60">
                  <tr>
                    <td colSpan={5} className="text-center">
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
          © {new Date().getFullYear()} — Módulo de Revisiones y Mantenimiento. En desarrollo.
        </div>
      </section>
    </main>
  );
};

/* ---------- Subcomponentes ---------- */

type ActionCardProps = {
  title: string;
  desc: string;
  disabled?: boolean;
};

const ActionCard: React.FC<ActionCardProps> = ({ title, desc, disabled }) => {
  return (
    <div className={`card shadow ${disabled ? "opacity-90" : ""}`}>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
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

export default Revisiones;
