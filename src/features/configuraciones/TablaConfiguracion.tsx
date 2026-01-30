import React from "react";
import { Pen } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useConfiguracionesPlazo } from "../../services/configuracionPlazoService";
import { useLoaderStore } from "../../store/loader.store";
import FormConfiguracion from "./FormConfiguracion";

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

  if (isError)
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar configuración de plazos
      </div>
    );

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap mb-3">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Configuración de plazos y servicios
        </h3>
        <button className="btn  btn-primary" onClick={openCrear}>
          Nueva configuración
        </button>
      </div>

      <div className="relative overflow-x-auto max-w-full px-4 pb-3">
        <table className="table table-zebra min-w-[800px]">
          <thead className="bg-base-200">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider bg-[#3498DB] [&>th]:text-white">
              <th>ID</th>
              <th className="text-right pr-4">Editar</th>

              <th>Código</th> {/* 👈 NUEVA COLUMNA */}
              <th>Servicio</th>
              <th>Plazo (meses)</th>
              <th>Tipo valor</th>
              <th className="text-right pr-4">Valor</th>
            </tr>
          </thead>
          <tbody>
            {tarifas.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td className="text-right pr-4">
                  <button
                    className="btn btn-sm bg-white btn-circle"
                    onClick={() => openEditar(t)}
                    title="Editar"
                  >
                    <Pen size={18} color="green" />
                  </button>
                </td>
                <td className="font-mono text-xs">{t.codigo}</td>
                <td className="font-medium">{t.servicio}</td>
                <td>{t.plazo_meses}</td>
                <td>{t.tipo_valor}</td>
                <td className="text-right pr-4">
                  {t.tipo_valor === "%"
                    ? `${Number(t.valor)} %`
                    : Number(t.valor).toLocaleString()}
                </td>

              </tr>
            ))}

            {tarifas.length === 0 && !isPending && (
              <tr>
                {/* ahora son 7 columnas */}
                <td colSpan={7} className="text-center py-6 text-base-content/60">
                  No hay configuraciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaConfiguracion;
