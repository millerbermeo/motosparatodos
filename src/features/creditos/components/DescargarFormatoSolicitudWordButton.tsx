// src/features/creditos/components/DescargarFormatoSolicitudWordButton.tsx
import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useCredito, useDeudor, useCodeudoresByDeudor } from "../../../services/creditosServices";
import { fmtCOP } from "../../../utils/money";
import { fmtFechaSolo } from "../../../utils/date";
import { alert } from "../../../utils/alerts";
import type { PersonaInfoWord, LaboralInfoWord, ReferenciaWord } from "../word/SolicitudCreditoWord";

const EMPRESA_NOMBRE = "VERIFICARTE AAA S.A.S.";
const LOGO_SRC = "/verificarte.jpg";

// Mismo look que CotizacionSingleMotoPDFButton, en verde (success)
const sameChipStyles =
  "group flex w-full items-center cursor-pointer max-h-14 justify-between " +
  "rounded-xl px-4 py-2 text-sm font-medium text-white " +
  "shadow-md transition-all hover:shadow-lg focus:outline-none " +
  "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed";

type Props = {
  codigo_credito: string;
};

const nombreCompleto = (p: any) =>
  [p?.primer_nombre, p?.segundo_nombre, p?.primer_apellido, p?.segundo_apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

const mapPersonal = (p: any): PersonaInfoWord => ({
  tipoDocumento: p?.tipo_documento,
  numeroDocumento: p?.numero_documento,
  fechaExpedicion: p?.fecha_expedicion,
  lugarExpedicion: p?.lugar_expedicion,
  nombres: [p?.primer_nombre, p?.segundo_nombre].filter(Boolean).join(" "),
  apellidos: [p?.primer_apellido, p?.segundo_apellido].filter(Boolean).join(" "),
  fechaNacimiento: p?.fecha_nacimiento,
  nivelEstudios: p?.nivel_estudios,
  ciudadResidencia: p?.ciudad_residencia,
  barrioResidencia: p?.barrio_residencia,
  direccionResidencia: p?.direccion_residencia,
  telefonoFijo: p?.telefono_fijo,
  celular: p?.celular,
  email: p?.email,
  estadoCivil: p?.estado_civil,
  personasACargo: p?.personas_a_cargo,
  tipoVivienda: p?.tipo_vivienda,
  fincaRaiz: p?.finca_raiz,
});

const mapLaboral = (l: any): LaboralInfoWord => ({
  empresa: l?.empresa,
  direccionEmpleador: l?.direccion_empleador,
  telefonoEmpleador: l?.telefono_empleador,
  cargo: l?.cargo,
  tipoContrato: l?.tipo_contrato,
  tiempoServicio: l?.tiempo_servicio,
  salario: l?.salario != null && Number(l.salario) > 0 ? fmtCOP(Number(l.salario)) : "",
});

const mapReferencias = (refs: any[]): ReferenciaWord[] =>
  (Array.isArray(refs) ? refs : []).map((r) => ({
    nombre: r?.nombre_completo,
    direccion: r?.direccion,
    tipo: r?.tipo_referencia,
    telefono: r?.telefono,
  }));

const resolveLogoArrayBuffer = async (
  url: string
): Promise<{ data: ArrayBuffer; type: "png" | "jpg" } | undefined> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const buf = await res.arrayBuffer();
    const type: "png" | "jpg" = /\.jpe?g($|\?)/i.test(url) ? "jpg" : "png";
    return { data: buf, type };
  } catch {
    return undefined;
  }
};

export const DescargarFormatoSolicitudWordButton: React.FC<Props> = ({ codigo_credito }) => {
  const [isGenerando, setIsGenerando] = useState(false);

  const { data: creditoResp } = useCredito({ codigo_credito }, !!codigo_credito);
  const credito = creditoResp?.success ? creditoResp.creditos?.[0] : undefined;

  const { data: deudorResp } = useDeudor(codigo_credito);
  const deudorData = (deudorResp as any)?.data ?? {};

  const { data: codeudoresResp } = useCodeudoresByDeudor(codigo_credito);
  const codeudores: any[] = Array.isArray((codeudoresResp as any)?.data)
    ? (codeudoresResp as any).data
    : [];
  const cod1 = codeudores[0];

  const handleDescargar = async () => {
    if (!codigo_credito) {
      alert.error("No se encontró el código de crédito.");
      return;
    }
    if (!credito) {
      alert.error("No se pudo cargar la información del crédito.");
      return;
    }

    setIsGenerando(true);
    try {
      const { generarSolicitudCreditoWord } = await import("../word/SolicitudCreditoWord");
      const logo = await resolveLogoArrayBuffer(LOGO_SRC);

      const deudorPersonal = deudorData?.informacion_personal ?? {};
      const deudorLaboral = deudorData?.informacion_laboral ?? {};
      const deudorReferencias = deudorData?.referencias ?? [];

      const codeudorPersonal = cod1?.informacion_personal;
      const codeudorLaboral = cod1?.informacion_laboral;
      const codeudorReferencias = cod1?.referencias ?? [];

      const blob = await generarSolicitudCreditoWord(
        {
          estado: credito.estado,
          creada: fmtFechaSolo(credito.fecha_creacion),
          agencia: "Agencia",
          registradaPor: credito.asesor,

          motocicleta: credito.producto,
          valorMotocicleta: credito.valor_producto ? fmtCOP(Number(credito.valor_producto)) : "",
          numeroCuotas: credito.plazo_meses ?? "",
          cuotaInicial: credito.cuota_inicial ? fmtCOP(Number(credito.cuota_inicial)) : "",
          valorCuota: credito.valor_cuota ? fmtCOP(Number(credito.valor_cuota)) : "",
          numeroChasis: credito.numero_chasis ?? "",
          numeroMotor: credito.numero_motor ?? "",
          placa: credito.placa ?? "",
          fechaEntrega: credito.fecha_entrega ? fmtFechaSolo(credito.fecha_entrega) : "",

          deudorNombreCompleto: nombreCompleto(deudorPersonal),
          deudorCc: deudorPersonal?.numero_documento ?? "",
          deudorPersonal: mapPersonal(deudorPersonal),
          deudorLaboral: mapLaboral(deudorLaboral),
          deudorReferencias: mapReferencias(deudorReferencias),

          codeudorNombreCompleto: cod1 ? nombreCompleto(codeudorPersonal) : "",
          codeudorCc: codeudorPersonal?.numero_documento ?? "",
          codeudorPersonal: codeudorPersonal ? mapPersonal(codeudorPersonal) : undefined,
          codeudorLaboral: codeudorLaboral ? mapLaboral(codeudorLaboral) : undefined,
          codeudorReferencias: mapReferencias(codeudorReferencias),

          nombreEmpresa: EMPRESA_NOMBRE,
        },
        logo
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Formato_Solicitud_Credito_${codigo_credito}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert.error("No fue posible generar el formato de solicitud de crédito.");
    } finally {
      setIsGenerando(false);
    }
  };

  return (
    <button
      type="button"
      className={sameChipStyles}
      onClick={handleDescargar}
      disabled={isGenerando || !credito}
      title="Descargar formato solicitud crédito"
    >
      <span className="flex items-center gap-2">
        {isGenerando ? "Generando..." : "Descargar formato solicitud crédito"}
      </span>
      <FileText className="w-4 h-4 opacity-80 group-hover:opacity-100" />
    </button>
  );
};

export default DescargarFormatoSolicitudWordButton;
