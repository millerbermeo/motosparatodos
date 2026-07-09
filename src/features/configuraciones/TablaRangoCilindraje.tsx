import React from "react";
import { Pen } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useLoaderStore } from "../../store/loader.store";
import { useRangosCilindraje } from "../../services/useRangosCilindraje";
import FormRangoCilindraje from "./FormRangoCilindraje";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";

const TablaRangoCilindraje: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { data, isPending, isError } = useRangosCilindraje();
  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  const rangos = Array.isArray(data) ? data : data ?? [];

  const openCrear = () =>
    open(<FormRangoCilindraje key="create" mode="create" />, "Nuevo rango de cilindraje", {
      size: "lg",
      position: "center",
    });

  const openEditar = (r: any) =>
    open(
      <FormRangoCilindraje key={`edit-${r.id}`} mode="edit" initialValues={r} />,
      `Editar rango: ${r.descripcion}`,
      { size: "lg", position: "center" }
    );

  const formatRango = (r: any) => {
    const min = r.cilindraje_min;
    const max = r.cilindraje_max;

    if (min == null && max == null) return "—";
    if (min != null && max != null) return `${min} - ${max} cc`;
    if (min != null && max == null) return `≥ ${min} cc`;
    if (min == null && max != null) return `≤ ${max} cc`;
    return "—";
  };

  const formatMoney = (v: any) =>
    Number(v || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const money = (className: string) => (className ? `text-right pr-4 font-mono text-xs ${className}` : "text-right pr-4 font-mono text-xs");

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "ID", render: (r) => r.id },
    {
      key: "editar",
      header: "Editar",
      align: "right",
      headerClassName: "pr-4",
      className: "pr-4",
      render: (r) => (
        <RowActionButton icon={<Pen size={18} color="green" />} title="Editar" onClick={() => openEditar(r)} />
      ),
    },
    { key: "descripcion", header: "Descripción", className: "font-medium", render: (r) => r.descripcion },
    { key: "cilindraje", header: "Cilindraje", render: (r) => formatRango(r) },
    { key: "soat", header: "SOAT", align: "right", headerClassName: "pr-4", className: money(""), render: (r) => formatMoney(r.soat) },
    {
      key: "matricula_credito",
      header: "Matr. crédito",
      align: "right",
      headerClassName: "pr-4",
      className: money(""),
      render: (r) => formatMoney(r.matricula_credito),
    },
    {
      key: "matricula_contado",
      header: "Matr. contado",
      align: "right",
      headerClassName: "pr-4",
      className: money(""),
      render: (r) => formatMoney(r.matricula_contado),
    },
    {
      key: "impuestos",
      header: "Impuestos",
      align: "right",
      headerClassName: "pr-4",
      className: money(""),
      render: (r) => formatMoney(r.impuestos),
    },
    {
      key: "total_credito",
      header: "Total crédito",
      align: "right",
      headerClassName: "pr-4",
      className: money("font-semibold"),
      render: (r) => formatMoney(r.total_credito),
    },
    {
      key: "total_contado",
      header: "Total contado",
      align: "right",
      headerClassName: "pr-4",
      className: money("font-semibold"),
      render: (r) => formatMoney(r.total_contado),
    },
  ];

  return (
    <DataTable
      title="Configuración de rangos de cilindraje y tarifas"
      toolbar={
        <button className="btn hidden btn-primary" onClick={openCrear}>
          Nuevo rango
        </button>
      }
      tableClassName="min-w-250"
      columns={columns}
      rows={rangos}
      rowKey={(r) => r.id}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar rangos de cilindraje"
      emptyMessage="No hay rangos configurados."
    />
  );
};

export default TablaRangoCilindraje;
