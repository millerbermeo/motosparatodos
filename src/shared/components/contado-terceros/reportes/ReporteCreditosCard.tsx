// src/components/reportes/cards/ReporteCreditosCard.tsx
import React from "react";
import { Download, FileSpreadsheet, CalendarDays, Filter } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { usePrecargarReporteCreditosFull } from "../../../../services/reporteCreditosService";

const ESTADOS_CREDITO = [
  "Aprobado",
  "Revisión",
  "Incompleto",
  "No viable",
  "En facturación",
  "Facturado",
] as const;

const toISODate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/* ===== Tipos para Excel (SIN IDS) ===== */
type ReportRow = {
  "Código crédito": string;
  "Fecha creación": string;
  "Última actualización": string;
  Estado: string;

  Asesor: string;
  Analista: string;

  "Nombre cliente": string;
  "Cédula cliente": string;

  Producto: string;
  "Valor producto": string;
  "Plazo (meses)": string;
  "Cuota inicial": string;

  "Preaprobado": string;
  "Revisado": string;

  "Entrega autorizada": string;
  "Entregado": string;

  Matrícula: string;
  SOAT: string;
  Impuestos: string;
  Accesorios: string;
  "Garantía extendida": string;
  Seguros: string;
  Total: string;

  Placa: string;
  "No. chasis": string;
  "No. motor": string;
  "Fecha entrega": string;
  "Fecha pago": string;

  Comentario: string;
};

const COLUMNS = [
  "Código crédito",
  "Fecha creación",
  "Última actualización",
  "Estado",
  "Asesor",
  "Analista",
  "Nombre cliente",
  "Cédula cliente",
  "Producto",
  "Valor producto",
  "Plazo (meses)",
  "Cuota inicial",
  "Preaprobado",
  "Revisado",
  "Entrega autorizada",
  "Entregado",
  "Matrícula",
  "SOAT",
  "Impuestos",
  "Accesorios",
  "Garantía extendida",
  "Seguros",
  "Total",
  "Placa",
  "No. chasis",
  "No. motor",
  "Fecha entrega",
  "Fecha pago",
  "Comentario",
] as const;

type ColumnKey = (typeof COLUMNS)[number];

const formatCOP = (v: any) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
};

const toSafeString = (v: any) => {
  if (v === null || v === undefined) return "";
  return String(v);
};

const ReporteCreditosCard: React.FC = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [from, setFrom] = React.useState<string>(toISODate(firstDay));
  const [to, setTo] = React.useState<string>(toISODate(now));
  const [estados, setEstados] = React.useState<string[]>([]);
  const [dateField, setDateField] = React.useState<"fecha_creacion" | "actualizado">(
    "fecha_creacion"
  );

  // Hook: trae TODO (all=1) pero SOLO cuando le das click
  const reporteQuery = usePrecargarReporteCreditosFull(
    { from, to, estados: estados.length ? estados : undefined, dateField },
    { enabled: false }
  );

  const downloadReporteCreditos = async () => {
    try {
      Swal.fire({
        title: "Generando reporte...",
        text: "Consultando créditos",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const { data: resp } = await reporteQuery.refetch();
      const rows: any[] = Array.isArray(resp?.data) ? resp!.data : [];

      const mapped: ReportRow[] = rows.map((c) => {
        return {
          // Identificador funcional (SIN ID numérico)
          "Código crédito": toSafeString(c.codigo_credito),

          // Fechas clave
          "Fecha creación": toSafeString(c.fecha_creacion),
          "Última actualización": toSafeString(c.actualizado),

          // Flujo / estado del crédito
          Estado: toSafeString(c.estado),
          Asesor: toSafeString(c.asesor),
          Analista: toSafeString(c.analista),

          // Cliente (lo más útil para negocio)
          "Nombre cliente": toSafeString(c.nombre_cliente),
          "Cédula cliente": toSafeString(c.cedula_cliente ?? c.cedula),

          // Producto y valores (lo más importante para el Excel)
          Producto: toSafeString(c.producto),
          "Valor producto": formatCOP(c.valor_producto),
          "Plazo (meses)": toSafeString(c.plazo_meses),
          "Cuota inicial": formatCOP(c.cuota_inicial),

          // Checks que suelen pedir en auditoría/seguimiento
          Preaprobado: toSafeString(c.proaprobado),
          Revisado: toSafeString(c.revisado),

          // Entrega / facturación
          "Entrega autorizada": toSafeString(c.entrega_autorizada),
          Entregado: toSafeString(c.entregado),

          // Componentes del total (según tu JSON)
          Matrícula: formatCOP(c.matricula),
          SOAT: formatCOP(c.soat),
          Impuestos: formatCOP(c.impuestos),
          Accesorios: formatCOP(c.accesorios_total),
          "Garantía extendida": formatCOP(c.garantia_extendida_valor),
          Seguros: formatCOP(c.precio_seguros),
          Total: formatCOP(c.total),

          // Datos de vehículo (cuando exista)
          Placa: toSafeString(c.placa),
          "No. chasis": toSafeString(c.numero_chasis),
          "No. motor": toSafeString(c.numero_motor),

          // Fechas de operación (cuando exista)
          "Fecha entrega": toSafeString(c.fecha_entrega),
          "Fecha pago": toSafeString(c.fecha_pago),

          // Comentario / observación final
          Comentario: toSafeString(c.comentario ?? c.observacion_final),
        };
      });

      const ws = XLSX.utils.json_to_sheet(mapped, { header: [...COLUMNS] });

      // Auto width
      ws["!cols"] = COLUMNS.map((key: ColumnKey) => {
        const headerLen = key.length;
        const maxCellLen = Math.max(
          headerLen,
          ...mapped.map((row) => String(row[key] ?? "").length)
        );
        return { wch: Math.min(Math.max(maxCellLen + 2, 10), 70) };
      });

      // Autofilter
      ws["!autofilter"] = {
        ref: XLSX.utils.encode_range({
          s: { r: 0, c: 0 },
          e: { r: mapped.length, c: COLUMNS.length - 1 },
        }),
      };

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Creditos");

      const fileFrom = from || "inicio";
      const fileTo = to || "hoy";
      XLSX.writeFile(wb, `reporte_creditos_${fileFrom}_a_${fileTo}.xlsx`);

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
              <h3 className="text-lg font-semibold">Reporte de créditos</h3>
              <p className="text-sm opacity-70">
                Exporta créditos filtrando por fechas y estados.
              </p>
            </div>
          </div>

          <button
            className="btn btn-success btn-sm gap-2"
            onClick={downloadReporteCreditos}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
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

          {/* Campo de fecha */}
          <label className="form-control w-full">
            <span className="label">
              <span className="label-text flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4 opacity-70" />
                Filtrar por
              </span>
            </span>

            <select
              className="select select-bordered w-full"
              value={dateField}
              onChange={(e) => setDateField(e.target.value as any)}
            >
              <option value="fecha_creacion">Fecha creación</option>
              <option value="actualizado">Fecha actualización</option>
            </select>

            <span className="label">
              <span className="label-text-alt opacity-70">
                Define qué fecha usa el rango.
              </span>
            </span>
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
                  onClick={() => setEstados([...ESTADOS_CREDITO])}
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
              {ESTADOS_CREDITO.map((estado) => (
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

        {/* Chips seleccionados */}
        {estados.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {estados.map((e) => (
              <div key={e} className="badge badge-outline">
                {e}
              </div>
            ))}
          </div>
        )}

        {/* Nota */}
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

export default ReporteCreditosCard;