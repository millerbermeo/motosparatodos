import React from 'react';
import { Bike } from 'lucide-react';
import type { Cotizacion, Motocicleta } from '../detallesCotizacion.type';
import { fmtCOP } from '../../../../utils/money';
import DataRow from './DataRow';
import DataRow2 from './DataRow2';
import DataRowText from './DataRowText';
import MotoImage from './MotoImage';
import {
  getFotoUrl,
  getGpsTexto,
  getGpsValorAplicado,
} from './detalleCotizacion.mapper';

type Props = {
  q: Cotizacion;
  moto?: Motocicleta;
  tab: 'A' | 'B';
  setTab: React.Dispatch<React.SetStateAction<'A' | 'B'>>;
  payload: any;
  showGarantiaExtendida: boolean;
  isContado: boolean;
  isCreditoTerceros: boolean;
  totalConTodo: number;
  saldoConTodo: number;
};

const MotoDetalleCard: React.FC<Props> = ({
  q,
  moto,
  tab,
  setTab,
  payload,
  showGarantiaExtendida,
  isContado,
  isCreditoTerceros,
  totalConTodo,
  saldoConTodo,
}) => {
  const polizaLabel = (isContado || isCreditoTerceros) ? 'Garantía extendida' : 'Póliza';

  return (
    <section className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
      <div className="card-body">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5" />
            <h2 className="card-title text-lg">Motocicletas</h2>
          </div>

          {q.motoB && (
            <div role="tablist" className="tabs tabs-boxed">
              <button
                role="tab"
                className={`tab rounded-lg px-4 py-2 ${tab === 'A'
                  ? 'tab-active bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setTab('A')}
              >
                Moto A
              </button>
              <button
                role="tab"
                className={`tab rounded-lg px-4 py-2 ml-2 ${tab === 'B'
                  ? 'tab-active bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setTab('B')}
              >
                Moto B
              </button>
            </div>
          )}
        </div>

        {moto && (
          <div className="mb-3 flex gap-5 items-center">
            <span className="badge badge-ghost">{moto.modelo}</span>
          </div>
        )}

        {moto ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-3 rounded-xl border border-base-300/60 p-3 bg-base-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Vehículo</h3>

              <DataRow label="Precio base" value={fmtCOP(moto.precioBase)} />
              <DataRow
                label="Descuentos"
                value={fmtCOP(-Math.abs(moto.descuentos || 0))}
                valueClass="text-error font-semibold"
              />
              <DataRow
                label="Precio neto vehículo"
                value={fmtCOP((moto.precioBase || 0) - (moto.descuentos || 0))}
                strong
              />

              <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                  Documentos
                </div>
                <div className="space-y-1.5">
                  <DataRow label="SOAT" value={fmtCOP(moto.soat || 0)} />
                  <DataRow label="Matrícula" value={fmtCOP(moto.matricula || 0)} />
                  <DataRow label="Impuestos" value={fmtCOP(moto.impuestos || 0)} />
                  <DataRow
                    label="TOTAL documentos"
                    value={fmtCOP((moto.soat || 0) + (moto.matricula || 0) + (moto.impuestos || 0))}
                    strong
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70 mb-1">
                  Adicionales y accesorios
                </div>

                <DataRow
                  label="Accesorios / Marcación / Personalización"
                  value={fmtCOP(moto.accesoriosYMarcacion)}
                />

                {(moto.adicionalesTotal ?? 0) > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <DataRow2 label="RUNT" value={fmtCOP(moto.adicionalesRunt || 0)} />
                    <DataRow2 label="Licencias" value={fmtCOP(moto.adicionalesLicencia || 0)} />
                    <DataRow2 label="Defensas" value={fmtCOP(moto.adicionalesDefensas || 0)} />
                    <DataRow2 label="Hand savers" value={fmtCOP(moto.adicionalesHandSavers || 0)} />
                    <DataRow2 label="Otros adicionales" value={fmtCOP(moto.adicionalesOtros || 0)} />
                    <DataRow2 label="TOTAL adicionales" value={fmtCOP(moto.adicionalesTotal || 0)} strong />
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-dashed border-base-300/80">
                  <DataRow
                    label="Subtotal extras (docs + accesorios + adicionales)"
                    value={fmtCOP(
                      (moto.precioDocumentos || 0) +
                      (moto.accesoriosYMarcacion || 0) +
                      (moto.adicionalesTotal || 0)
                    )}
                    strong
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-base-300/60 p-3 bg-base-100 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Resumen</h3>

                <div className="space-y-1.5 mt-1">
                  <DataRowText label="Garantía" value={moto.garantia ? 'Sí' : 'No'} />

                  {showGarantiaExtendida && (
                    <DataRowText
                      label="Garantía extendida"
                      value={
                        typeof moto.garantiaExtendidaMeses === 'number' &&
                        (moto.garantiaExtendidaMeses ?? 0) > 0
                          ? `${moto.garantiaExtendidaMeses} meses`
                          : 'No aplica'
                      }
                    />
                  )}

                  <div className="mt-2 pt-2 border-t border-dashed border-base-300/80 space-y-1.5">
                    <DataRow
                      label="Total sin documentos / adicionales / accesorios / seguros"
                      value={fmtCOP((moto.precioBase || 0) - (moto.descuentos || 0))}
                    />
                    <DataRow
                      label="Total con documentos / adicionales / accesorios /  seguros"
                      value={fmtCOP(totalConTodo)}
                      strong
                    />
                    <DataRow label="Otros seguros" value={fmtCOP(moto.otrosSeguros || 0)} />

                    {(Number(moto.polizaValor ?? 0) > 0 || (moto.polizaCodigo && moto.polizaCodigo !== '0')) && (
                      <>
                        <DataRowText label={polizaLabel} value={moto.polizaCodigo || '—'} />
                        <DataRow
                          label={`Valor ${polizaLabel.toLowerCase()}`}
                          value={fmtCOP(Number(moto.polizaValor ?? 0))}
                        />
                      </>
                    )}

                    {moto.cuotas.inicial > 0 && (
                      <DataRow
                        label="Cuota inicial"
                        value={fmtCOP(moto.cuotas.inicial)}
                        valueClass="text-error font-semibold"
                      />
                    )}

                    <DataRow
                      label="Saldo a financiar"
                      value={fmtCOP(saldoConTodo)}
                      strong
                      valueClass="text-black font-bold"
                    />

                    <DataRowText
                      label={isContado ? 'GPS' : 'GPS (meses)'}
                      value={getGpsTexto(moto, isContado)}
                    />

                    <DataRow
                      label="Valor GPS"
                      value={fmtCOP(getGpsValorAplicado(moto))}
                    />

                    {showGarantiaExtendida && (
                      <DataRow
                        label="Valor garantía extendida"
                        value={fmtCOP(Number(moto.garantiaExtendidaValor ?? 0))}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-base-300/60 bg-base-100 p-3 flex items-center justify-center">
                <MotoImage
                  src={getFotoUrl(payload, tab)}
                  alt={`Moto ${tab} – ${moto?.modelo || ""}`}
                  thumbClassName="w-40 h-28 md:w-64 md:h-40"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-70">
            No hay información de la {tab === 'A' ? 'Moto A' : 'Moto B'}.
          </div>
        )}
      </div>
    </section>
  );
};

export default MotoDetalleCard;