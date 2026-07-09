import React from "react";
import { Pen } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useConfiguracionesPlazo } from "../../services/configuracionPlazoService";
import { useLoaderStore } from "../../store/loader.store";
import FormConfiguracion from "./FormConfiguracion";
import { DataTable } from "../../shared/components/datatable/DataTable";
import { RowActionButton } from "../../shared/components/datatable/RowActions";
import type { DataTableColumn } from "../../shared/components/datatable/types";

const TablaConfiguracion: React.FC = () => {
  const open = useModalStore((s) => s.open);
  const { data, isPending, isError } = useConfiguracionesPlazo();
  const { show, hide } = useLoaderStore();

  React.useEffect(() => {
    if (isPending) show();
    else hide();
  }, [isPending, show, hide]);

  const tarifas = Array.isArray(data) ? data : data ?? [];

  const openCrear = () =>
    open(<FormConfiguracion key="create" mode="create" />, "Crear configuración", {
      size: "md",
      position: "center",
    });

  const openEditar = (t: any) =>
    open(
      <FormConfiguracion key={`edit-${t.id}`} mode="edit" initialValues={t} />,
      `Editar: ${t.codigo} - ${t.servicio} (${t.plazo_meses} meses)`,
      { size: "md", position: "center" }
    );

  const columns: DataTableColumn<any>[] = [
    { key: "id", header: "ID", render: (t) => t.id },
    {
      key: "editar",
      header: "Editar",
      align: "right",
      headerClassName: "pr-4",
      className: "pr-4",
      render: (t) => (
        <RowActionButton icon={<Pen size={18} color="green" />} title="Editar" onClick={() => openEditar(t)} />
      ),
    },
    { key: "codigo", header: "Código", className: "font-mono text-xs", render: (t) => t.codigo },
    { key: "servicio", header: "Servicio", className: "font-medium", render: (t) => t.servicio },
    { key: "plazo_meses", header: "Plazo (meses)", render: (t) => t.plazo_meses },
    { key: "tipo_valor", header: "Tipo valor", render: (t) => t.tipo_valor },
    {
      key: "valor",
      header: "Valor",
      align: "right",
      headerClassName: "pr-4",
      className: "pr-4",
      render: (t) => (t.tipo_valor === "%" ? `${Number(t.valor)} %` : Number(t.valor).toLocaleString()),
    },
  ];

  return (
    <DataTable
      title="Configuración de plazos y servicios"
      toolbar={
        <button className="btn hidden btn-primary" onClick={openCrear}>
          Nueva configuración
        </button>
      }
      tableClassName="min-w-200"
      columns={columns}
      rows={tarifas}
      rowKey={(t) => t.id}
      isLoading={isPending}
      isError={isError}
      errorMessage="Error al cargar configuración de plazos"
      emptyMessage="No hay configuraciones registradas."
    />
  );
};

export default TablaConfiguracion;
