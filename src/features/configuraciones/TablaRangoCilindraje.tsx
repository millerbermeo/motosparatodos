import React from "react";
import { Pen } from "lucide-react";
import { useModalStore } from "../../store/modalStore";
import { useLoaderStore } from "../../store/loader.store";
import { useRangosCilindraje } from "../../services/useRangosCilindraje";
import FormRangoCilindraje from "./FormRangoCilindraje";

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

  if (isError)
    return (
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xl p-4 text-error">
        Error al cargar rangos de cilindraje
      </div>
    );

  return (
    <div className="rounded-2xl flex flex-col border border-base-300 bg-base-100 shadow-xl">
      <div className="px-4 pt-4 flex items-center justify-between gap-3 flex-wrap mb-3">
        <h3 className="text-sm font-semibold tracking-wide text-base-content/70">
          Configuración de rangos de cilindraje y tarifas
        </h3>
        <button className="btn hidden btn-primary" onClick={openCrear}>
          Nuevo rango
        </button>
      </div>

      <div className="relative overflow-x-auto max-w-full px-4 pb-3">
        <table className="table table-zebra min-w-[1000px]">
          <thead className="bg-base-200">
            <tr className="[&>th]:uppercase [&>th]:text-xs [&>th]:font-semibold [&>th]:tracking-wider bg-[#3498DB] [&>th]:text-white">
              <th>ID</th>
               <th className="text-right pr-4">Editar</th>
              <th>Descripción</th>
              <th>Cilindraje</th>
              <th className="text-right pr-4">Precio base</th>
              <th className="text-right pr-4">SOAT</th>
              <th className="text-right pr-4">Matr. crédito</th>
              <th className="text-right pr-4">Matr. contado</th>
              <th className="text-right pr-4">Impuestos</th>
              <th className="text-right pr-4">Total crédito</th>
              <th className="text-right pr-4">Total contado</th>
             
            </tr>
          </thead>
          <tbody>
            {rangos.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                  <td className="text-right pr-4">
                  <button
                    className="btn btn-sm bg-white btn-circle"
                    onClick={() => openEditar(r)}
                    title="Editar"
                  >
                    <Pen size={18} color="green" />
                  </button>
                </td>
                <td className="font-medium">{r.descripcion}</td>
                <td>{formatRango(r)}</td>
                <td className="text-right pr-4 font-mono text-xs">
                  {formatMoney(r.precio)}
                </td>
                <td className="text-right pr-4 font-mono text-xs">
                  {formatMoney(r.soat)}
                </td>
                <td className="text-right pr-4 font-mono text-xs">
                  {formatMoney(r.matricula_credito)}
                </td>
                <td className="text-right pr-4 font-mono text-xs">
                  {formatMoney(r.matricula_contado)}
                </td>
                <td className="text-right pr-4 font-mono text-xs">
                  {formatMoney(r.impuestos)}
                </td>
                <td className="text-right pr-4 font-mono text-xs font-semibold">
                  {formatMoney(r.total_credito)}
                </td>
                <td className="text-right pr-4 font-mono text-xs font-semibold">
                  {formatMoney(r.total_contado)}
                </td>
              
              </tr>
            ))}

            {rangos.length === 0 && !isPending && (
              <tr>
                {/* ahora son 11 columnas */}
                <td colSpan={11} className="text-center py-6 text-base-content/60">
                  No hay rangos configurados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaRangoCilindraje;
