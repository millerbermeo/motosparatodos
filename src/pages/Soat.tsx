import React from "react";

const Soat: React.FC = () => {
  return (
    <main className="w-full">
      {/* HERO full width */}
      <section className="relative w-full bg-linear-to-r from-emerald-700 via-emerald-600 to-emerald-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="badge badge-outline border-white/60 text-white/90 mb-3">
                Módulo en desarrollo
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                SOAT — Seguro Obligatorio (Colombia)
              </h1>
              <p className="mt-2 text-white/90 max-w-2xl">
                Consulta y gestión del SOAT. Pronto podrás cotizar, verificar
                vigencia, y registrar pagos directamente desde la plataforma.
              </p>
            </div>

            {/* Tarjeta de estado */}
            <div className="shrink-0">
              <div className="stats shadow bg-white/10 backdrop-blur-sm text-white">
                <div className="stat">
                  <div className="stat-title text-white/80">Estado</div>
                  <div className="stat-value text-white">En desarrollo</div>
                  <div className="stat-desc text-white/80">
                    Próxima versión habilitará transacciones
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* “Ribbon” de desarrollo */}
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
            title="Cotizar / Comprar SOAT"
            desc="Realiza una cotización en línea y completa tu compra en minutos."
            disabled
          />
          <ActionCard
            title="Consultar vigencia"
            desc="Valida si tu póliza SOAT está vigente y conoce su fecha de expiración."
            disabled
          />
          <ActionCard
            title="Historial y comprobantes"
            desc="Descarga pólizas y recibos asociados a tus vehículos."
            disabled
          />
        </div>

        {/* Formulario de consulta rápida */}
        <div className="mt-8 card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="card-title">Consulta rápida</h2>
                <p className="text-base-content/70">
                  Ingresa los datos del vehículo y del titular para consultar o
                  iniciar una cotización. (Módulo en desarrollo)
                </p>
              </div>
              <span className="badge badge-warning badge-outline">Próximamente</span>
            </div>

            {/* Overlay de desarrollo */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-base-200/40 backdrop-blur-[1px]" />

              <form
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-90"
                aria-disabled
              >
                <Field
                  label="Placa del vehículo"
                  placeholder="ABC123"
                  type="text"
                />
                <Field
                  label="Tipo de documento"
                  as="select"
                  options={[
                    "Cédula de ciudadanía",
                    "Cédula de extranjería",
                    "NIT",
                    "Pasaporte",
                  ]}
                />
                <Field
                  label="Número de documento"
                  placeholder="1XXXXXXXXX"
                  type="text"
                />
                <Field label="Celular" placeholder="3XXXXXXXXX" type="tel" />
                <Field label="Email" placeholder="correo@dominio.com" type="email" />
                <Field
                  label="Ciudad"
                  as="select"
                  options={["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga"]}
                />
              </form>

              <div className="mt-4 flex items-center gap-3">
                <button className="btn btn-primary btn-disabled" disabled>
                  Consultar / Cotizar
                </button>
                <span className="text-sm text-base-content/70">
                  Esta acción estará disponible en la próxima versión.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información / ayuda */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Acerca del SOAT</h3>
              <p className="text-base-content/80">
                El SOAT (Seguro Obligatorio para Accidentes de Tránsito) es un
                seguro de carácter obligatorio en Colombia. Pronto podrás
                gestionar tu póliza desde este módulo: cotización, compra y
                verificación de vigencia.
              </p>
              <ul className="mt-3 list-disc pl-5 text-base-content/80 space-y-1">
                <li>Compatibilidad con motocicletas, autos y más.</li>
                <li>Soporte para distintos tipos de documento del titular.</li>
                <li>Descarga de póliza y envío al correo del cliente.</li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Estado del módulo</h3>
              <div className="space-y-2 text-sm text-base-content/80">
                <p>• Diseño UI/UX: Completado ✅</p>
                <p>• Formularios: En progreso ⏳</p>
                <p>• Integración con proveedor SOAT: Pendiente 📦</p>
                <p>• Pruebas y despliegue: Pendiente 🧪</p>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline btn-sm" disabled>
                  Reportar necesidad / feedback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer simple */}
        <div className="mt-10 text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Módulo SOAT. En desarrollo.
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

export default Soat;
