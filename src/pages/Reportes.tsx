// src/components/reportes/Reportes.tsx
import React from "react";
import { Filter, Download, Hammer } from "lucide-react";

type Operacion = {
  fecha: string;
  placa: string;
  cliente: string;
  modelo: string;
  tipo: "Venta (Crédito)" | "Venta (Contado)" | "Crédito";
  valor: number;
  estado: "Aprobado" | "Rechazado" | "Pendiente" | "Pagado";
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

const operaciones: Operacion[] = [
  { fecha: "2025-08-10", placa: "KMV-321", cliente: "Laura Gómez", modelo: "AKT 125", tipo: "Venta (Crédito)", valor: 7_500_000, estado: "Aprobado" },
  { fecha: "2025-08-11", placa: "ZPX-102", cliente: "Carlos Ruiz", modelo: "Yamaha FZ 2.0", tipo: "Venta (Contado)", valor: 11_800_000, estado: "Pagado" },
  { fecha: "2025-08-12", placa: "GHC-889", cliente: "Diana Torres", modelo: "Honda CB 125F", tipo: "Crédito", valor: 9_200_000, estado: "Pendiente" },
  { fecha: "2025-08-13", placa: "BTR-550", cliente: "Juan Pérez", modelo: "Suzuki Gixxer 150", tipo: "Crédito", valor: 12_400_000, estado: "Rechazado" },
];

const inventario = { nuevo: 132, usado: 28, demo: 6 };

const Reportes: React.FC = () => {
  // Filtros (solo UI, sin lógica — demo simple)
  const [rango, setRango] = React.useState("Últimos 12 meses");
  const [sucursal, setSucursal] = React.useState("Todas");
  const [vendedor, setVendedor] = React.useState("Todos");

  // KPIs simples
  const totalUnidades = operaciones.length; // demo
  const totalIngresos = operaciones
    .filter((o) => o.estado === "Pagado" || o.estado === "Aprobado")
    .reduce((a, b) => a + b.valor, 0);
  const tasaAprobacion =
    Math.round(
      (operaciones.filter((o) => o.estado === "Aprobado").length / Math.max(operaciones.length, 1)) * 100
    ) + "%";
  const inventarioTotal = inventario.nuevo + inventario.usado + inventario.demo;

  return (
    <main className="w-full">
      {/* Encabezado sencillo */}
      <section className="w-full bg-base-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold">Reportes — Demo simple</h1>
          <p className="text-base-content/70">
            Resumen básico de ventas, créditos e inventario (datos estáticos, sin gráficos).
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filtros (solo UI) */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base-content/70">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filtros</span>
              </div>
              <span className="badge badge-warning badge-outline">
                <Hammer className="w-3 h-3 mr-1" /> En desarrollo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <label className="form-control w-full">
                <span className="label">
                  <span className="label-text">Rango</span>
                </span>
                <select
                  className="select select-bordered"
                  value={rango}
                  onChange={(e) => setRango(e.target.value)}
                  disabled
                >
                  {["Últimos 3 meses", "Últimos 6 meses", "Últimos 12 meses", "Año actual"].map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label">
                  <span className="label-text">Sucursal</span>
                </span>
                <select
                  className="select select-bordered"
                  value={sucursal}
                  onChange={(e) => setSucursal(e.target.value)}
                  disabled
                >
                  {["Todas", "Centro", "Norte", "Sur"].map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <span className="label">
                  <span className="label-text">Vendedor</span>
                </span>
                <select
                  className="select select-bordered"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  disabled
                >
                  {["Todos", "Ana", "Luis", "Camila", "Jorge"].map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3">
              <button className="btn btn-outline btn-sm btn-disabled" disabled>
                <Download className="w-4 h-4" />
                Exportar (Próximamente)
              </button>
            </div>
          </div>
        </div>

        {/* KPIs básicos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat title="Unidades (demo)" value={String(totalUnidades)} />
          <Stat title="Ingresos (demo)" value={formatCOP(totalIngresos)} />
          <Stat title="Tasa aprobación" value={tasaAprobacion} />
          <Stat title="Inventario total" value={String(inventarioTotal)} />
        </div>

        {/* Resúmenes muy simples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Inventario (simple)</h3>
              <ul className="mt-2 text-base-content/80 space-y-1">
                <li>Nuevo: <span className="font-medium">{inventario.nuevo}</span></li>
                <li>Usado: <span className="font-medium">{inventario.usado}</span></li>
                <li>Demo: <span className="font-medium">{inventario.demo}</span></li>
              </ul>
            </div>
          </div>

          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">Cartera (simple)</h3>
              <ul className="mt-2 text-base-content/80 space-y-1">
                <li>Aprobados: <span className="font-medium">{operaciones.filter(o => o.estado === "Aprobado").length}</span></li>
                <li>Pendientes: <span className="font-medium">{operaciones.filter(o => o.estado === "Pendiente").length}</span></li>
                <li>Rechazados: <span className="font-medium">{operaciones.filter(o => o.estado === "Rechazado").length}</span></li>
                <li>Pagados: <span className="font-medium">{operaciones.filter(o => o.estado === "Pagado").length}</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabla simple */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title">Operaciones recientes (demo)</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Placa</th>
                    <th>Cliente</th>
                    <th>Modelo</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {operaciones.map((op, i) => (
                    <tr key={i}>
                      <td>{op.fecha}</td>
                      <td>{op.placa}</td>
                      <td>{op.cliente}</td>
                      <td>{op.modelo}</td>
                      <td>{op.tipo}</td>
                      <td>{formatCOP(op.valor)}</td>
                      <td>
                        <span
                          className={[
                            "badge",
                            op.estado === "Aprobado" || op.estado === "Pagado"
                              ? "badge-success"
                              : op.estado === "Rechazado"
                              ? "badge-error"
                              : "badge-warning",
                          ].join(" ")}
                        >
                          {op.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {operaciones.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center opacity-60">
                        Sin datos (demo)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="alert alert-info mt-4">
              <Hammer className="w-5 h-5" />
              <span>Este es un ejemplo básico con datos estáticos.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Reportes (demo simple).
        </div>
      </section>
    </main>
  );
};

/* ---------- Subcomponentes muy simples ---------- */

const Stat: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="stats bg-base-100 shadow">
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-primary">{value}</div>
    </div>
  </div>
);

export default Reportes;
