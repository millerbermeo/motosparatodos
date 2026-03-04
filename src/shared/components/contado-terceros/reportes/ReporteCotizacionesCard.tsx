import React from "react";
import { Download, FileSpreadsheet, CalendarDays, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { usePrecargarReporteCotizacionesFull } from "../../../../services/cotizacionesReporteService";

const ESTADOS_COTIZACION = [
  "Solicitar crédito",
  "Solicitar facturación",
  "Facturado",
  "Continúa interesado",
  "Sin estado",
  "Sin interés",
  "Revisión",
] as const;

const toISODate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ===== Tipos para Excel (evita TS7053) ===== */
type ReportRow = {
  "Id cotizacion": string;
  "Fecha de cotizacion": string;
  "Fecha de venta": string;
  Estado: string;

  Marca: string;
  Linea: string;
  Modelo: string;

  Cliente: string;
  "Nombre Cliente": string;
  Telefono: string;
  Email: string;
  Cedula: string;
  "Fecha nacimiento": string;

  Agencia: string;
  "Nombre Asesor": string;
  Financiera: string;
  Canal: string;
  Pregunta: string;
  Subdistribuidor: string;
};

const COLUMNS = [
  "Id cotizacion",
  "Fecha de cotizacion",
  "Fecha de venta",
  "Estado",
  "Marca",
  "Linea",
  "Modelo",
  "Cliente",
  "Nombre Cliente",
  "Telefono",
  "Email",
  "Cedula",
  "Fecha nacimiento",
  "Agencia",
  "Nombre Asesor",
  "Financiera",
  "Canal",
  "Pregunta",
  "Subdistribuidor",
] as const;

type ColumnKey = (typeof COLUMNS)[number];

const ReporteCotizacionesCard: React.FC = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [from, setFrom] = React.useState<string>(toISODate(firstDay));
  const [to, setTo] = React.useState<string>(toISODate(now));
  const [estados, setEstados] = React.useState<string[]>([]);

  // Hook: trae TODO (all=1) pero SOLO cuando tú le das click (enabled:false)
  const reporteQuery = usePrecargarReporteCotizacionesFull(
    { from, to, estados: estados.length ? estados : undefined },
    { enabled: false }
  );

  const downloadReporteCotizaciones = async () => {
    try {
      Swal.fire({
        title: "Generando reporte...",
        text: "Consultando cotizaciones",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data: resp } = await reporteQuery.refetch();
      const rows: any[] = Array.isArray(resp?.data) ? resp!.data : [];

      const mapped: ReportRow[] = rows.map((c) => {
        const marca = (c.moto_seleccionada === "B" ? c.marca_b : c.marca_a) ?? "";
        const linea = (c.moto_seleccionada === "B" ? c.linea_b : c.linea_a) ?? "";
        const modelo = (c.moto_seleccionada === "B" ? c.modelo_b : c.modelo_a) ?? "";

        const nombreCompleto = [c.name, c.s_name, c.last_name, c.s_last_name]
          .filter(Boolean)
          .join(" ");

        return {
          "Id cotizacion": String(c.idPrimaria ?? c.id_cotizacion ?? c.id ?? ""),
          "Fecha de cotizacion": String(c.fecha_creacion ?? ""),
          "Fecha de venta": String(c.fecha_actualizacion ?? ""),
          Estado: String(c.estado ?? ""),

          Marca: String(marca),
          Linea: String(linea),
          Modelo: String(modelo),

          Cliente: String(nombreCompleto),
          "Nombre Cliente": String(c.name ?? ""),
          Telefono: String(c.celular ?? ""),
          Email: String(c.email ?? ""),
          Cedula: String(c.cedula ?? ""),
          "Fecha nacimiento": String(c.fecha_nacimiento ?? ""),

          Agencia: String(c.id_empresa_a ?? c.id_empresa_b ?? ""),
          "Nombre Asesor": String(c.asesor ?? ""),
          Financiera: String(c.financiera ?? ""),
          Canal: String(c.canal_contacto ?? ""),
          Pregunta: String(c.pregunta ?? ""),
          Subdistribuidor: String(c.prospecto ?? ""),
        };
      });

      const ws = XLSX.utils.json_to_sheet(mapped, { header: [...COLUMNS] });

      // Auto width (SIN TS7053) + límites razonables
      ws["!cols"] = COLUMNS.map((key: ColumnKey) => {
        const headerLen = key.length;
        const maxCellLen = Math.max(
          headerLen,
          ...mapped.map((row) => String(row[key] ?? "").length)
        );
        return { wch: Math.min(Math.max(maxCellLen + 2, 10), 60) };
      });

      // Autofilter en encabezados
      ws["!autofilter"] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: mapped.length, c: COLUMNS.length - 1 },
        }),
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Cotizaciones");

      const fileFrom = from || "inicio";
      const fileTo = to || "hoy";
      XLSX.writeFile(wb, `reporte_cotizaciones_${fileFrom}_a_${fileTo}.xlsx`);

      Swal.fire({
        icon: "success",
        title: "Reporte descargado ✅",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No fue posible generar el reporte.",
      });
    }
  };

  const isLoading = reporteQuery.isFetching;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm w-full">
      <div className="card-body w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-primary/10 border border-base-300">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Reporte de cotizaciones</h3>
              <p className="text-sm opacity-70">
                Exporta cotizaciones filtrando por fechas y estados.
              </p>
            </div>
          </div>

          <button
            className="btn btn-success btn-sm gap-2"
            onClick={downloadReporteCotizaciones}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar Excel
              </>
            )}
          </button>
        </div>

        <div className="divider my-3" />

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Desde */}
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text flex items-center gap-2 font-medium">
                <CalendarDays className="w-4 h-4 opacity-70" />
                Desde
              </span>
            </span>

            <input
              type="date"
              className="input input-bordered w-full"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          {/* Hasta */}
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text flex items-center gap-2 font-medium">
                <CalendarDays className="w-4 h-4 opacity-70" />
                Hasta
              </span>
            </span>

            <input
              type="date"
              className="input input-bordered w-full"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          {/* Estados */}
          <label className="form-control w-full">
            <span className="label flex justify-between items-center">
              <span className="label-text flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4 opacity-70" />
                Estados
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-xs btn-outline"
                  onClick={() => setEstados([...ESTADOS_COTIZACION])}
                >
                  Todos
                </button>

                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  onClick={() => setEstados([])}
                >
                  Limpiar
                </button>
              </div>
            </span>

            <select
              multiple
              className="select select-bordered h-36 w-full"
              value={estados}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map(
                  (o) => o.value
                );
                setEstados(selected);
              }}
            >
              {ESTADOS_COTIZACION.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <span className="label">
              <span className="label-text-alt opacity-70">
                Selecciona varios con Ctrl / Cmd + click
              </span>
            </span>
          </label>
        </div>

        {/* Chips seleccionados (mantengo todo, solo más limpio) */}
        {estados.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {estados.map((e) => (
              <div key={e} className="badge badge-outline">
                {e}
              </div>
            ))}
          </div>
        )}

        {/* Nota de estado (mantengo) */}
        <div className="mt-4 flex items-center justify-between text-xs opacity-60">
          <span>{isLoading ? "Procesando solicitud…" : "Listo para generar"}</span>
          <span className="font-mono">
            {estados.length ? `${estados.length} estado(s)` : "sin filtro de estados"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReporteCotizacionesCard;