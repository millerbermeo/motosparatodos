// src/components/home/Home.tsx
import React from "react";
import {
  Bike,
  CreditCard,
  Users,
  BarChart3,
  Wrench,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

const Home: React.FC = () => {
  // Datos demo mínimos (estáticos)
  const kpis = {
    unidadesMes: 58,
    ingresosMes: 236_000_000,
    creditosPendientes: 7,
    citasHoy: 3,
  };

  const formatCOP = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(v);

  const recientes = [
    { fecha: "2025-08-14", tipo: "Venta", detalle: "AKT 125 — Laura Gómez", estado: "Completado" },
    { fecha: "2025-08-15", tipo: "Crédito", detalle: "Honda CB125F — Juan Pérez", estado: "Pendiente" },
    { fecha: "2025-08-16", tipo: "Revisión", detalle: "Yamaha FZ — Cambio aceite", estado: "Agendado" },
  ];

  return (
    <main className="w-full">
      {/* HERO */}
      <section className="w-full bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold">Panel principal</h1>
          <p className="text-white/90 mt-1">
            Resumen rápido del concesionario: ventas, créditos, revisiones y SOAT.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            icon={<Bike className="w-5 h-5" />}
            title="Unidades (mes)"
            value={String(kpis.unidadesMes)}
          />
          <KpiCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Ingresos (mes)"
            value={formatCOP(kpis.ingresosMes)}
          />
          <KpiCard
            icon={<CreditCard className="w-5 h-5" />}
            title="Créditos pendientes"
            value={String(kpis.creditosPendientes)}
          />
          <KpiCard
            icon={<Wrench className="w-5 h-5" />}
            title="Citas hoy"
            value={String(kpis.citasHoy)}
          />
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickCard
            icon={<PlusCircle className="w-5 h-5" />}
            title="Nueva venta"
            desc="Registrar venta de motocicleta."
            actionLabel="Abrir"
            disabled
          />
          <QuickCard
            icon={<CreditCard className="w-5 h-5" />}
            title="Solicitud de crédito"
            desc="Crear solicitud para cliente."
            actionLabel="Abrir"
            disabled
          />
          <QuickCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="SOAT"
            desc="Cotizar / verificar vigencia."
            actionLabel="Abrir"
            disabled
          />
        </div>

        {/* Actividad reciente */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Actividad reciente</h3>
              <span className="badge badge-outline">Demo</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((r, i) => (
                    <tr key={i}>
                      <td>{r.fecha}</td>
                      <td>{r.tipo}</td>
                      <td>{r.detalle}</td>
                      <td>
                        <span
                          className={[
                            "badge",
                            r.estado === "Completado"
                              ? "badge-success"
                              : r.estado === "Pendiente"
                              ? "badge-warning"
                              : "badge-info",
                          ].join(" ")}
                        >
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recientes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center opacity-60">
                        Sin actividad (demo)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-2 text-sm text-base-content/70">
              Tip: Conecta este listado a tus endpoints para ver movimientos reales.
            </div>
          </div>
        </div>

        {/* Bloque sencillo de atajos informativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            title="Clientes"
            icon={<Users className="w-5 h-5" />}
            lines={[
              "Nuevos este mes: 12",
              "Con crédito activo: 48",
              "Con SOAT por vencer (30 días): 9",
            ]}
          />
          <InfoCard
            title="Taller"
            icon={<Wrench className="w-5 h-5" />}
            lines={["OT abiertas: 5", "Repuestos críticos: 3", "Citas mañana: 4"]}
          />
        </div>

        {/* Footer simple */}
        <div className="text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Dashboard (demo).
        </div>
      </section>
    </main>
  );
};

/* ---------- Subcomponentes simples ---------- */

const KpiCard: React.FC<{ icon?: React.ReactNode; title: string; value: string }> = ({
  icon,
  title,
  value,
}) => (
  <div className="stats bg-base-100 shadow">
    <div className="stat">
      <div className="stat-title flex items-center gap-2">
        {icon} {title}
      </div>
      <div className="stat-value text-primary">{value}</div>
    </div>
  </div>
);

const QuickCard: React.FC<{
  icon?: React.ReactNode;
  title: string;
  desc: string;
  actionLabel: string;
  disabled?: boolean;
}> = ({ icon, title, desc, actionLabel, disabled }) => (
  <div className="card bg-base-100 shadow">
    <div className="card-body">
      <h3 className="card-title flex items-center gap-2">
        {icon} {title}
      </h3>
      <p className="text-base-content/70">{desc}</p>
      <div className="card-actions justify-end">
        <button className={`btn btn-primary ${disabled ? "btn-disabled" : ""}`} disabled={disabled}>
          {actionLabel}
        </button>
      </div>
    </div>
  </div>
);

const InfoCard: React.FC<{
  title: string;
  icon?: React.ReactNode;
  lines: string[];
}> = ({ title, icon, lines }) => (
  <div className="card bg-base-100 shadow">
    <div className="card-body">
      <h3 className="card-title flex items-center gap-2">
        {icon} {title}
      </h3>
      <ul className="mt-1 list-disc pl-5 text-base-content/80 space-y-1">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default Home;
