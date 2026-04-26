// src/pages/DetallesFacturacion.tsx
import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCotizacionFullById } from "../services/fullServices";
import DocumentosSolicitud from "../features/solicitudes/DocumentosSolicitud";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useIvaDecimal } from "../services/ivaServices";
import { useAuthStore } from "../store/auth.store";
import {
  useUltimaSolicitudPorIdCotizacion,
  useActualizarFacturaSolicitud,
  useDescuentosContraentrega
} from "../services/solicitudServices";
import DescuentosContraentregaPanel from "../shared/components/DescuentosContraentregaPanel";
import SolicitudFacturaPDF2 from "../features/creditos/pdf/SolicitudFacturaPDF2";
import { useEmpresaById } from "../services/empresasServices";
import ManifiestoUploader from "../shared/components/ManifiestoUploader";
import CedulaUploader from "../shared/components/CedulaUploader";
import { toNum } from "../utils/convertirNumeroSeguro";
import { fmtFecha } from "../utils/date";
import { fmtCOP } from "../utils/money";
import { RowRight } from "../shared/components/facturacion/RowRight";
import { buildMotoFromCotizacion } from "../shared/components/facturacion/buildMotoFromCotizacion";
import { desglosarConIva } from "../shared/components/facturacion/desglosarIva";
import { toAbsoluteUrl } from "../utils/files";
import { alert } from "../utils/alerts";
import { max0, pick, sum } from "../shared/components/facturacion/utilsFacturacion";


const DetallesFacturacion: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const id_cotizacion = (idParam ?? "").trim();

  const { data, isLoading, isError, error, refetch } =
    useCotizacionFullById(id_cotizacion);


  // Última solicitud de facturación por id_cotizacion
  const {
    data: ultimaSolData,
    isLoading: isUltimaSolLoading,
    isError: isUltimaSolError,
  } = useUltimaSolicitudPorIdCotizacion(id_cotizacion);

  // Hook para actualizar factura
  const {
    mutate: actualizarFactura,
    isPending: isSubiendoFactura,
  } = useActualizarFacturaSolicitud();



  // Estado local para el archivo de factura
  const [facturaFile, setFacturaFile] = useState<File | null>(null);

  // IVA desde backend (fallback si la cotización no trae el campo)
  const {
    porcentaje,
    isLoading: ivaLoading,
    error: ivaError,
  } = useIvaDecimal();

  // data = { success, data: { cotizacion, creditos, solicitar_estado_facturacion } }
  const cot = data?.data?.cotizacion ?? null;
  const cred = data?.data?.creditos ?? null;
  const sol = data?.data?.solicitar_estado_facturacion ?? null;

  // IVA: prioridad al campo `iva` de la cotización (ej. "19.0000" = 19%)
  // Si no existe o no es válido, usa el hook de IVA dinámico
  const ivaCotizacionPct = cot ? Number((cot as any).iva) : NaN;
  const ivaDesdeCotizacion = Number.isFinite(ivaCotizacionPct) && ivaCotizacionPct > 0;

  const IVA_PCT = ivaDesdeCotizacion
    ? ivaCotizacionPct
    : ivaLoading || ivaError ? 19 : Number(porcentaje ?? 19);

  const IVA_DEC = IVA_PCT / 100;

  const user = useAuthStore((s) => s.user);


  // ===================== EMPRESA (igual que en DetalleCotizacion) =====================
  const rawIdEmpresa =
    cot?.id_empresa_a ??
    cot?.id_empresa_b ??
    (cred as any)?.id_empresa ??
    null;

  const idEmpresa = rawIdEmpresa ? Number(rawIdEmpresa) : undefined;

  const {
    data: empresaSeleccionada,
    isLoading: loadingEmpresa,
  } = useEmpresaById(idEmpresa);


  // Objeto que espera el PDF
  const empresaPDF = useMemo(() => {
    if (!empresaSeleccionada) {
      // Fallback si algo falla
      return {
        nombre: "",
        ciudad: "",
        almacen: "",
        nit: "",
        telefono: "",
        direccion: "",
      };
    }

    return {
      nombre: empresaSeleccionada.nombre_empresa,
      ciudad: "Cali", // o campo real si lo tienes
      almacen: empresaSeleccionada.nombre_empresa,
      nit: empresaSeleccionada.nit_empresa,
      telefono: empresaSeleccionada.telefono_garantias ?? "",
      direccion: empresaSeleccionada.direccion_siniestros ?? "",
    };
  }, [empresaSeleccionada]);

  // Logo de la empresa para el PDF
  const logoUrl = useMemo(() => {
    const fromEmpresa = empresaSeleccionada?.foto
      ? toAbsoluteUrl(empresaSeleccionada.foto)
      : null;

    // Si no hay logo en la empresa, usa uno por defecto
    return fromEmpresa || "/motomax.png";
  }, [empresaSeleccionada]);


  // ===================== SELECCIÓN DE MOTO A/B =====================

  const motoSeleccionada: "a" | "b" | undefined = useMemo(() => {
    if (!cot) return undefined;

    const descA = [cot.marca_a, cot.linea_a].filter(Boolean).join(" ").toLowerCase();
    const descB = [cot.marca_b, cot.linea_b].filter(Boolean).join(" ").toLowerCase();

    const refTexto = [sol?.motocicleta, sol?.modelo, cred?.producto]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (refTexto && descA && refTexto.includes(descA)) return "a";
    if (refTexto && descB && refTexto.includes(descB)) return "b";

    if (descA && !descB) return "a";
    if (descB && !descA) return "b";

    return undefined;
  }, [cot, sol, cred]);

  const pickMotoField = (base: string): any => {
    if (!cot) return undefined;
    const anyCot: any = cot;
    const fa = anyCot[`${base}_a`];
    const fb = anyCot[`${base}_b`];

    if (motoSeleccionada === "a") return fa ?? fb ?? anyCot[base];
    if (motoSeleccionada === "b") return fb ?? fa ?? anyCot[base];

    return fa ?? fb ?? anyCot[base];
  };

  // ===== NUEVO: moto seleccionada, con los mismos cálculos de DetalleCotizacion =====
  const ladoMoto: "A" | "B" | undefined =
    motoSeleccionada === "a" ? "A" : motoSeleccionada === "b" ? "B" : undefined;

  const motoCot = useMemo(
    () =>
      cot && ladoMoto ? buildMotoFromCotizacion(cot, ladoMoto) : undefined,
    [cot, ladoMoto]
  );


  const descuentos = useMemo(() => {
    if (motoCot) return motoCot.descuentos ?? 0;

    const raw =
      motoSeleccionada === "b"
        ? (cot as any)?.descuentos_b
        : (cot as any)?.descuentos_a;

    return Number(raw) || 0;
  }, [motoCot, cot, motoSeleccionada]);



  // ✅ Garantía extendida (hoy viene como "póliza")
  const garantiaExtendidaValor = useMemo(() => {
    if (!cot) return 0;

    const vA =
      Number((cot as any)?.valor_poliza_a ?? (cot as any)?.valor_garantia_extendida_a ?? 0) || 0;

    const vB =
      Number((cot as any)?.valor_poliza_b ?? (cot as any)?.valor_garantia_extendida_b ?? 0) || 0;

    // Si ya decidiste moto A/B:
    if (motoSeleccionada === "a") return Math.max(vA, 0);
    if (motoSeleccionada === "b") return Math.max(vB, 0);

    // fallback (si no se detectó moto)
    return Math.max(vA || vB, 0);
  }, [cot, motoSeleccionada]);


  // ===================== ESTADO / CLIENTE =====================

  const estadoCotizacion: string | undefined =
    cot?.estado ||
    (sol as any)?.estado ||
    (sol as any)?.estado_facturacion ||
    undefined;

  // Tipo de pago unificado
  const tipoPagoTexto = (
    cot?.tipo_pago ?? cred?.tipo_pago ?? sol?.tipo_solicitud ?? ""
  )
    .toString()
    .toLowerCase();

  const esContado = tipoPagoTexto.includes("contado");

  // Crédito de terceros (con o sin tilde)
  const esCreditoTerceros =
    tipoPagoTexto.includes("crédito de terceros") ||
    tipoPagoTexto.includes("credito de terceros");

  const ultimaSolRegistro: any =
    (ultimaSolData as any)?.registro ?? ultimaSolData ?? null;

  const idSolicitud =
    ultimaSolRegistro && ultimaSolRegistro.id
      ? Number(ultimaSolRegistro.id)
      : undefined;

  const { data: descuentosCE } = useDescuentosContraentrega(idSolicitud, {
    enabled: !!idSolicitud,
  });


  const observacionesSolicitud: string =
    (ultimaSolRegistro?.observaciones ??
      (sol as any)?.observaciones ??
      "")?.toString();


  const finalizadoActaRaw =
    (sol as any)?.is_final_acta ??
    (sol as any)?.is_final ??
    (ultimaSolRegistro as any)?.is_final_acta ??
    (ultimaSolRegistro as any)?.is_final ??
    0;

  const isFinalAutorizacion: boolean = (() => {
    if (!ultimaSolRegistro) return false;
    const raw =
      ultimaSolRegistro.is_final !== undefined
        ? ultimaSolRegistro.is_final
        : ultimaSolRegistro.isFinal;
    const n = Number(raw);
    return Number.isFinite(n) && n === 1;
  })();


  const aplicaDescuentosAutorizados =
    !!descuentosCE?.isFinal || isFinalAutorizacion; // por si el flag viene desde otra parte

  const descuentoAutorizadoB = aplicaDescuentosAutorizados
    ? Math.abs(Number(descuentosCE?.descuentoAutorizadoB ?? 0))
    : 0;

  const saldoContraentregaB = aplicaDescuentosAutorizados
    ? Math.abs(Number(descuentosCE?.saldoContraentregaB ?? 0))
    : 0;

  // ✅ total a restar (los “dos campos”)
  const descuentoAutorizadoTotal = descuentoAutorizadoB + saldoContraentregaB;

  const mostrarSeccionDescuentosAutorizar =
    aplicaDescuentosAutorizados && (descuentoAutorizadoTotal ?? 0) > 0;



  // ✅ Observación de autorización (viene en descuentosCE)
  const observacionAutorizacion = (descuentosCE?.observacion2 ?? "").toString().trim();

  // ✅ texto final: junta ambas si aplica
  const observacionesFinal = useMemo(() => {
    const o1 = (observacionesSolicitud ?? "").toString().trim();
    const o2 = observacionAutorizacion;

    // solo mostrar observacion2 si aplica autorización final
    const aplicaObs2 = aplicaDescuentosAutorizados && o2.length > 0;

    if (o1 && aplicaObs2) {
      return `${o1}\n\n\nObservación de autorización:\n${o2}`;
    }
    if (!o1 && aplicaObs2) {
      return `Observación de autorización:\n${o2}`;
    }
    return o1; // solo observación normal
  }, [observacionesSolicitud, observacionAutorizacion, aplicaDescuentosAutorizados]);



  const clienteNombre = useMemo(
    () =>
      pick<string>(
        sol?.nombre_cliente,
        [cot?.name, cot?.s_name, cot?.last_name, cot?.s_last_name]
          .filter(Boolean)
          .join(" ")
      ) ?? "—",
    [cot, sol]
  );

  const clienteDocumento =
    pick<string>(sol?.numero_documento, cot?.cedula) ?? "—";
  const clienteTelefono = pick<string>(sol?.telefono, cot?.celular) ?? "—";
  const clienteEmail = pick<string>(sol?.email, cot?.email) ?? "—";

  const codigoSolicitud =
    pick<string>(sol?.codigo, cot?.codigo, id_cotizacion) ?? id_cotizacion;

  const fechaCreacion =
    pick<string>(sol?.creado_en, cot?.fecha_creacion, cred?.fecha_creacion) ??
    "—";
  const asesor = pick<string>(cred?.asesor, cot?.asesor) ?? "—";

  // ===================== MOTO (USANDO A / B CORRECTA) =====================

  const marcaLinea =
    pick<string>(
      [sol?.motocicleta, sol?.modelo].filter(Boolean).join(" "),
      [pickMotoField("marca"), pickMotoField("linea")]
        .filter(Boolean)
        .join(" "),
      [cot?.marca_a, cot?.linea_a].filter(Boolean).join(" ")
    ) ?? "—";

  const numeroMotor =
    pick<string>(sol?.numero_motor, cred?.numero_motor) ?? "—";
  const numeroChasis =
    pick<string>(sol?.numero_chasis, cred?.numero_chasis) ?? "—";
  const color = pick<string>(sol?.color, cred?.color) ?? "—";
  const placa = pick<string>(sol?.placa, cred?.placa) ?? "—";

  // ===================== DOCUMENTOS & EXTRAS (BASE PARA TODOS LOS CÁLCULOS) =====================

  // Documentos: si tenemos motoCot usamos sus valores (para cuadrar con DetalleCotizacion)
  const soat = motoCot
    ? motoCot.soat
    : toNum(
      pick(
        sol?.tot_soat,
        pickMotoField("soat"),
        cot?.soat_a,
        cot?.soat_b,
        cred?.soat
      )
    );

  const matricula = motoCot
    ? motoCot.matricula
    : toNum(
      pick(
        sol?.tot_matricula,
        pickMotoField("matricula"),
        pickMotoField("precio_documentos"),
        cot?.matricula_a,
        cot?.matricula_b,
        cot?.precio_documentos_a,
        cot?.precio_documentos_b,
        cred?.matricula
      )
    );

  const impuestos = motoCot
    ? motoCot.impuestos
    : toNum(
      pick(
        sol?.tot_impuestos,
        pickMotoField("impuestos"),
        cot?.impuestos_a,
        cot?.impuestos_b,
        cred?.impuestos
      )
    );

  const subtotalDocs =
    motoCot
      ? (motoCot.soat || 0) + (motoCot.matricula || 0) + (motoCot.impuestos || 0)
      : toNum((sol as any)?.tot_documentos) ?? sum(soat, matricula, impuestos);

  // === EXTRAS (Accesorios + Adicionales) ===
  // Si hay motoCot: estos valores SON SIN IVA (brutos)
  const accesoriosBrutos = motoCot?.accesoriosYMarcacion ?? 0;
  const adicionalesBrutos = motoCot?.adicionalesTotal ?? 0;
  const gpsBruto = motoCot?.gpsValor ?? 0;
  const extrasBrutosTotal = accesoriosBrutos + adicionalesBrutos + gpsBruto;

  // IVA extras (siempre calculado)
  const iva_extras_total = Math.round(extrasBrutosTotal * IVA_DEC);
  const extras_total_con_iva = extrasBrutosTotal + iva_extras_total;

  // Para PDF/UI: si hay motoCot usamos estos; si NO hay motoCot usamos lo que venga del backend
  const accesorios_bruto = motoCot
    ? extrasBrutosTotal
    : toNum(sol?.acc_valor_bruto) ?? 0;

  const acc_iva_accesorios = motoCot
    ? iva_extras_total
    : toNum(sol?.acc_iva) ?? 0;

  const accesorios_total = motoCot
    ? extras_total_con_iva
    : toNum(pick(sol?.acc_total, cred?.accesorios_total)) ?? 0;


  // Seguros (preferimos lo que trae la cotización, igual que en DetalleCotizacion)
  const seguros_total =
    motoCot && typeof motoCot.seguros === "number"
      ? motoCot.seguros
      : toNum(
        pick(
          sol?.tot_seguros_accesorios,
          cred?.precio_seguros
        )
      );

  const acc_seg_total = (accesorios_total || 0) + (seguros_total || 0);

  // ===================== VALOR DEL VEHÍCULO (SOLO MOTO) =====================

  const valorProducto =
    toNum(cred?.valor_producto) ?? toNum(pickMotoField("precio_total"));

  let valorMoto: number | undefined;

  if (typeof valorProducto === "number" && Number.isFinite(valorProducto)) {
    const docs =
      (typeof soat === "number" ? soat : 0) +
      (typeof matricula === "number" ? matricula : 0) +
      (typeof impuestos === "number" ? impuestos : 0);

    const extras =
      (typeof accesorios_total === "number" ? accesorios_total : 0) +
      (typeof seguros_total === "number" ? seguros_total : 0);

    const base = valorProducto - docs - extras;
    valorMoto = base > 0 ? base : valorMoto;
  } else {
    // Fallback: precio_base de la cotización
    valorMoto = toNum(pickMotoField("precio_base"));
  }


  // === TOTAL VEHÍCULO (con IVA) ===
  // Si hay motoCot: asumimos que motoCot.total es el TOTAL GENERAL de la cotización (ya con descuento aplicado)
  const cn_total_calc_base = motoCot
    ? (motoCot.total || 0) -
    (subtotalDocs || 0) -
    (extrasBrutosTotal || 0) -  // ✅ extras SIN IVA
    (seguros_total || 0)
    : toNum(sol?.cn_total) ??
    toNum(sol?.tot_general) ??
    valorMoto ??
    toNum(pickMotoField("precio_base")) ??
    0;


  // ✅ ahora sí: restar autorización (solo cuando aplica)
  const cn_total_calc = (cn_total_calc_base || 0);

  const totalVehiculoConIva = motoCot
    ? (motoCot.precioBase || 0) // ✅ solo precio base
    : (cn_total_calc || 0);

  const { bruto: cn_bruto, iva: cn_iva } =
    desglosarConIva(totalVehiculoConIva, undefined, undefined, IVA_DEC);

  const cn_total_base =
    typeof cn_bruto === "number" && typeof cn_iva === "number"
      ? cn_bruto + cn_iva
      : undefined;

  const cn_total =
    typeof cn_total_base === "number"
      ? Math.max(cn_total_base - Math.abs(descuentos || 0), 0)
      : undefined;


  // ===================== TOTAL GENERAL =====================

  // Si tenemos motoCot, su total es la verdad (igual que en DetalleCotizacion)
  const totalGeneral =
    (cn_total || 0) +
    (subtotalDocs || 0) +
    (accesorios_total || 0) +
    (seguros_total || 0) +
    (garantiaExtendidaValor || 0) - // ✅ aquí entra
    (aplicaDescuentosAutorizados ? (descuentoAutorizadoTotal || 0) : 0);

  // ===================== CRÉDITO (POR SI APLICA) =====================

  // const cn_total_sin_iva = cn_bruto; // ya viene con descuento aplicado

  // const extras_sin_iva = extrasBrutosTotal; // ya lo tienes como bruto total

  // const total_general_sin_iva =
  //   (cn_total_sin_iva || 0) +
  //   (subtotalDocs || 0) +
  //   (extras_sin_iva || 0) +
  //   (seguros_total || 0);


  // 1) Cuota inicial desde el crédito (si existe registro en la tabla de créditos)
  const cuotaInicialCredito = toNum(cred?.cuota_inicial);

  // 2) Cuota inicial desde la cotización, según la moto seleccionada (A o B)
  const cuotaInicialCotizacion =
    motoSeleccionada === "b"
      ? toNum((cot as any)?.cuota_inicial_b)
      : toNum((cot as any)?.cuota_inicial_a);

  // 3) Cuota inicial unificada:
  const cuota_inicial =
    cuotaInicialCredito ??
    cuotaInicialCotizacion ??
    0;

  // Financiador: primero lo que venga de créditos, si no, lo que trae la cotización
  const financiador =
    pick<string>(cred?.producto, cot?.financiera) ?? "—";

  // 4) Saldo a financiar = TOTAL GENERAL - CUOTA INICIAL
  const saldoFinanciar =
    max0((totalGeneral ?? 0) - (cuota_inicial ?? 0)) ?? 0;

  // ===================== URLS DE DOCUMENTOS (BASE) =====================

  const manifiesto_url =
    sol && (sol as any).manifiesto_url
      ? (sol as any).manifiesto_url
      : cred?.formato_referencia || null;

  const cedula_url =
    sol && (sol as any).cedula_url
      ? (sol as any).cedula_url
      : cred?.formato_datacredito || null;

  const factura_url =
    (sol as any)?.factura_url || (cot as any)?.factura_url || null;

  const carta_url =
    (sol as any)?.carta_url || (cot as any)?.carta_url || null;

  const numeroReciboSolicitud: string | null =
    (ultimaSolRegistro &&
      (ultimaSolRegistro.numero_recibo ?? ultimaSolRegistro.numeroRecibo)) ??
    sol?.numero_recibo ??
    null;

  const resiboPagoSolicitud: string | null =
    (ultimaSolRegistro &&
      (ultimaSolRegistro.resibo_pago ?? ultimaSolRegistro.recibo_pago)) ??
    sol?.resibo_pago ??
    null;

  const cedulaPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.cedula) || null;

  const manifiestoPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.manifiesto) || null;

  const facturaPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.factura) ?? null;

  const cartaPathUlt: string | null =
    (ultimaSolRegistro && ultimaSolRegistro.carta) ?? null;


  // ===== NUEVO: otros_documentos (vienen como JSON en TEXT) =====
  const otrosDocsRaw: any =
    (ultimaSolRegistro && (ultimaSolRegistro.otros_documentos_rutas ?? ultimaSolRegistro.otros_documentos)) ??
    (sol as any)?.otros_documentos_rutas ??
    (sol as any)?.otros_documentos ??
    null;

  const otrosDocsPaths: string[] = useMemo(() => {
    if (!otrosDocsRaw) return [];
    if (Array.isArray(otrosDocsRaw)) return otrosDocsRaw.filter(Boolean).map(String);

    if (typeof otrosDocsRaw === "string") {
      const t = otrosDocsRaw.trim();
      if (!t) return [];
      try {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
        // si no es array, lo tratamos como 1 solo path
        return [t];
      } catch {
        // si NO es JSON válido, tratamos como path único
        return [t];
      }
    }

    return [];
  }, [otrosDocsRaw]);

  const otrosDocsUrls: string[] = useMemo(() => {
    return otrosDocsPaths
      .map((p) => toAbsoluteUrl(p))
      .filter((u): u is string => !!u);
  }, [otrosDocsPaths]);


  const cedulaUrlFinal =
    ultimaSolRegistro
      ? toAbsoluteUrl(cedulaPathUlt)
      : toAbsoluteUrl(cedulaPathUlt) || toAbsoluteUrl(cedula_url);
  const manifiestoUrlFinal =
    ultimaSolRegistro
      ? toAbsoluteUrl(manifiestoPathUlt)
      : toAbsoluteUrl(manifiestoPathUlt) || toAbsoluteUrl(manifiesto_url);
  const facturaUrlFinal =
    toAbsoluteUrl(facturaPathUlt) || toAbsoluteUrl(factura_url);
  const cartaUrlFinal =
    toAbsoluteUrl(cartaPathUlt) || toAbsoluteUrl(carta_url);

  const tieneFactura = !!facturaUrlFinal;

  // 🔹 LÓGICA PARA MOSTRAR PANEL / DOCUMENTOS
  // - Contado y Crédito de terceros → pasan por DescuentosContraentregaPanel, luego DocumentosSolicitud cuando is_final = 1
  // - Créditos normales → NO panel; van directo a DocumentosSolicitud cuando hay factura + idSolicitud

  const debeMostrarDescuentosPanel =
    (esContado || esCreditoTerceros) && !!idSolicitud && tieneFactura && !isFinalAutorizacion;

  const debeMostrarDocumentosSolicitud =
    ((esContado || esCreditoTerceros) && isFinalAutorizacion) ||
    (!esContado && !esCreditoTerceros && !!idSolicitud && tieneFactura);

  // ===================== HANDLERS FACTURA =====================

  const tieneManifiesto = !!manifiestoUrlFinal;


  const handleFacturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFacturaFile(file || null);
  };

  const navigate = useNavigate();

  const handleSubirFactura = () => {
    if (!idSolicitud) {
      alert.warn(
        "Sin solicitud",
        "No se encontró el ID de la solicitud de facturación. Verifica que exista una solicitud."
      );
      return;
    }

    if (!facturaFile) {
      alert.info(
        "Archivo requerido",
        "Selecciona un archivo de factura antes de enviar."
      );
      return;
    }

    const fd = new FormData();
    fd.append("id", String(idSolicitud));
    fd.append("factura", facturaFile);
    fd.append("id_cotizacion", id_cotizacion);
    fd.append("facturado", "Si");
    fd.append("facturador", user?.name || user?.rol || "");


    actualizarFactura(fd, {
      onSuccess: () => {
        setFacturaFile(null);
        refetch();
      },
    });
  };

  const metodoPagoTexto = (cot?.metodo_pago ?? "")
    .toString()
    .toLowerCase();

  const esMetodoPagoCreditoTerceros =
    metodoPagoTexto.includes("crédito de terceros") ||
    metodoPagoTexto.includes("credito de terceros");

  const volverAtras = () => {
    navigate("/solicitudes");
  };


  return (
    <main className="min-h-screen w-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between gap-5">
          <h1 className="text-xl font-semibold tracking-tight">
            Detalles de Facturación
          </h1>
          <button
            onClick={() => refetch()}
            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          >
            Recargar datos
          </button>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 py-8 space-y-6">
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            Cargando información…
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
            Error al cargar detalles: {String((error as any)?.message ?? "")}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Cliente */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h2 className="text-base font-semibold text-emerald-700 mb-3">
                    Cliente
                  </h2>
                  <div className="text-sm leading-6 text-slate-700 space-y-1.5">
                    <div className="font-medium text-slate-900">
                      {clienteNombre}
                    </div>
                    <div className="text-slate-600">{clienteDocumento}</div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Teléfono:
                      </span>{" "}
                      <span className="text-slate-600">
                        {clienteTelefono}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        Correo:
                      </span>{" "}
                      <span className="text-slate-600">
                        {clienteEmail}
                      </span>
                    </div>
                    <div className="pt-2 text-xs text-slate-500 space-y-0.5">
                      {cot?.canal_contacto && (
                        <div>
                          <span className="font-semibold">
                            Canal de contacto:
                          </span>{" "}
                          {cot.canal_contacto}
                        </div>
                      )}
                      {cot?.pregunta && (
                        <div>
                          <span className="font-semibold">
                            Necesidad del cliente:
                          </span>{" "}
                          {cot.pregunta}
                        </div>
                      )}
                      {cot?.metodo_pago && (
                        <div>
                          <span className="font-semibold">
                            Método de pago:
                          </span>{" "}
                          {cot.metodo_pago}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <div className="h-full rounded-lg bg-[#F1FCF6] border border-success p-4 flex flex-col justify-center md:justify-end md:items-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        Solicitud #{codigoSolicitud}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Creado: {fmtFecha(fechaCreacion)}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Asesor: {asesor}
                      </div>
                      {estadoCotizacion && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                          Estado: {estadoCotizacion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {observacionesFinal && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
                <div className="p-6">
                  <h3 className="text-base font-semibold text-amber-900">Observaciones</h3>
                  <p className="mt-2 text-sm text-amber-900 whitespace-pre-wrap">
                    {observacionesFinal}
                  </p>
                </div>
              </section>
            )}


            {/* Motocicleta */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-linear-to-r from-sky-600 to-emerald-600 text-white font-semibold px-5 py-2.5 text-sm">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3"># Pago</div>
                  <div className="col-span-3">Motocicleta</div>
                  <div className="col-span-2"># Motor</div>
                  <div className="col-span-2"># Chasis</div>
                  <div className="col-span-1 text-right">Color</div>
                  <div className="col-span-1 text-right">Placa</div>
                </div>
              </div>

              <div className="px-5 py-3 text-sm text-slate-800">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 truncate">
                    {numeroReciboSolicitud ?? resiboPagoSolicitud}
                  </div>
                  <div className="col-span-3 truncate">{marcaLinea}</div>
                  <div className="col-span-2 truncate">{numeroMotor}</div>
                  <div className="col-span-2 truncate">{numeroChasis}</div>
                  <div className="col-span-1 text-right">{color}</div>
                  <div className="col-span-1 text-right">{placa}</div>
                </div>
              </div>
            </section>


            {/* Condiciones del negocio */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
                <span>Condiciones del negocio</span>
                <span>Costos</span>
              </div>
              <div className="divide-y divide-slate-200">
                <RowRight
                  label="Valor bruto vehículo:"
                  value={fmtCOP(cn_bruto)}
                />
                {/* <RowRight
                  label="Total vehículo (sin IVA):"
                  value={fmtCOP(cn_total_sin_iva)}
                  bold
                /> */}
                <RowRight
                  label={`IVA vehículo (${IVA_PCT}%):`}
                  value={fmtCOP(cn_iva)}
                />
                <RowRight
                  label="Total vehículo sin descuento:"
                  value={fmtCOP((cn_total ?? 0) + Math.abs(descuentos ?? 0))}
                  bold
                  badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"
                />


                <RowRight
                  label="Total vehículo con descuento:"
                  value={fmtCOP(-Math.abs(descuentos))}
                />

                <RowRight
                  label="Total vehículo:"
                  value={fmtCOP(cn_total)}
                  bold
                  badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"
                />

              </div>
              {/* <div className="px-5 pb-3 pt-1 text-[11px] text-slate-500">
                IVA calculado automáticamente a partir del total del vehículo
                cuando no viene informado en la solicitud.
              </div> */}
            </section>


            {mostrarSeccionDescuentosAutorizar && (

              <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-emerald-600 text-white font-semibold px-5 py-2.5 text-sm flex items-center justify-between">
                  <span>Descuentos Autorizar</span>
                  <span>Costos</span>
                </div>
                <div className="divide-y divide-slate-200">


                  <RowRight
                    label="Descuento autorizado:"
                    value={aplicaDescuentosAutorizados ? fmtCOP(-descuentoAutorizadoB) : "—"}
                  />

                  <RowRight
                    label="Saldo contraentrega autorizado:"
                    value={aplicaDescuentosAutorizados ? fmtCOP(-saldoContraentregaB) : "—"}
                  />

                  <RowRight
                    label="Total a descontar (autorización):"
                    value={aplicaDescuentosAutorizados ? fmtCOP(-descuentoAutorizadoTotal) : "—"}
                    bold
                    badge="inline-block rounded-full bg-red-50 border-red-200 text-red-700 px-2 py-0.5"

                  />



                </div>
              </section>

            )}



            {/* Documentos */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-sky-700 text-white font-semibold px-5 py-2.5 text-sm">
                Documentos
              </div>
              <div className="divide-y divide-slate-200">
                <RowRight label="SOAT:" value={fmtCOP(soat)} />
                <RowRight label="Matrícula:" value={fmtCOP(matricula)} />
                <RowRight label="Impuestos:" value={fmtCOP(impuestos)} />
                <RowRight
                  label="Subtotal documentos:"
                  value={fmtCOP(subtotalDocs)}
                  bold
                  badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"

                />
              </div>
            </section>

            {/* Seguros, accesorios y total */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
                  Adicionales y accesorios                </div>
                <div className="divide-y divide-slate-200">

                  {gpsBruto > 0 && (
                    <RowRight
                      label="GPS:"
                      value={fmtCOP(gpsBruto)}
                    />
                  )}


                  <RowRight
                    label="Accesorios (bruto):"
                    value={fmtCOP(accesoriosBrutos)}
                  />

                  <RowRight
                    label="Adicionales (bruto):"
                    value={fmtCOP(adicionalesBrutos)}
                  />

                  <RowRight
                    badge="inline-block rounded-full bg-red-50 border-red-200 text-red-700 px-2 py-0.5"
                    label="Extras total sin IVA:"
                    value={fmtCOP(extrasBrutosTotal)}

                  />

                  <RowRight
                    label={`IVA extras (${IVA_PCT}%):`}
                    value={fmtCOP(iva_extras_total)}
                    bold
                  />

                  <RowRight
                    label="Extras total con IVA:"
                    value={fmtCOP(extras_total_con_iva)}
                    bold
                    badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"

                  />
                </div>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="bg-sky-600 text-white font-semibold px-5 py-2.5 text-sm">
                  TOTAL
                </div>
                <div className="divide-y divide-slate-200">
                  <RowRight
                    label="Total vehículo:"
                    value={fmtCOP(cn_total)}
                  />
                  <RowRight
                    label="Documentos:"
                    value={fmtCOP(subtotalDocs)}
                  />
                  <RowRight
                    label="Seguros + (Accesorios + IVA):"
                    value={fmtCOP(acc_seg_total)}
                  />

                  {mostrarSeccionDescuentosAutorizar && (

                    <RowRight
                      label="Total a descontar (autorización):"
                      value={aplicaDescuentosAutorizados ? fmtCOP(-descuentoAutorizadoTotal) : "—"}
                      bold
                      badge="inline-block rounded-full bg-red-50 border-red-200 text-red-700 px-2 py-0.5"

                    />
                  )}
                  <RowRight
                    label="Valor Garantía"
                    value={fmtCOP(garantiaExtendidaValor)}
                  />


                  <RowRight
                    label="TOTAL GENERAL:"
                    value={fmtCOP(totalGeneral)}
                    bold
                    badge="inline-block rounded-full bg-emerald-50 border-emerald-200 text-emerald-700 px-2 py-0.5"
                  />
                </div>
              </div>
            </section>
            {!tieneFactura && (
              <>
                <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="bg-slate-800 text-white  p-3 font-semibold px-5.py-2.5 text-sm flex items-center justify-between">
                    <span>Soportes de pago y documentos adjuntos</span>
                    {isUltimaSolLoading && (
                      <span className="text-xs text-slate-200">
                        Cargando adjuntos…
                      </span>
                    )}
                    {isUltimaSolError && (
                      <span className="text-xs text-red-200">
                        Error al cargar adjuntos
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-4 text-sm text-slate-800">

                    <div className="pt-2 border-t border-dashed border-slate-200 mt-2">
                      <div className="text-xs font-semibold text-slate-500 mb-2">
                        Archivos descargables:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={cedulaUrlFinal ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-xs border ${cedulaUrlFinal
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                        >
                          Cédula {cedulaUrlFinal ? "" : "(no disponible)"}
                        </a>
                        <a
                          href={manifiestoUrlFinal ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-xs border ${manifiestoUrlFinal
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                            : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                            }`}
                        >
                          Manifiesto{" "}
                          {manifiestoUrlFinal ? "" : "(no disponible)"}
                        </a>

                        {/* ✅ NUEVO: Otros documentos (pueden ser varios) */}
                        {otrosDocsUrls.length > 0 ? (
                          otrosDocsUrls.map((url, idx) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                            >
                              Otro documento #{idx + 1}
                            </a>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            Otros documentos (no disponibles)
                          </span>
                        )}


                        {/* Factura: mostramos botón solo si existe */}
                        {facturaUrlFinal && (
                          <a
                            href={facturaUrlFinal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          >
                            Factura
                          </a>
                        )}

                        {/* Carta: SOLO si método de pago es Crédito de terceros */}
                        {cartaUrlFinal && esMetodoPagoCreditoTerceros && (
                          <a
                            href={cartaUrlFinal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          >
                            Carta
                          </a>
                        )}

                      </div>
                    </div>


                    {!tieneManifiesto && !!idSolicitud && (
                      <ManifiestoUploader
                        idSolicitud={idSolicitud}
                        idCotizacion={id_cotizacion}
                        manifiestoUrlFinal={manifiestoUrlFinal}
                        onUploaded={() => {
                          refetch();
                        }}
                      />
                    )}

                    {!cedulaPathUlt && !!idSolicitud && (
                      <CedulaUploader
                        idSolicitud={idSolicitud}
                        idCotizacion={id_cotizacion}
                        onUploaded={() => {
                          refetch();
                        }}
                      />
                    )}

                    {/* Carga de factura: SOLO si aún NO hay factura */}
                    {!tieneFactura && (
                      <div className="mt-4 pt-3 bg-success p-3 rounded-2xl border-t border-dashed border-slate-200 space-y-2">
                        <div className="text-xs font-semibold text-slate-600">
                          Cargar factura (obligatoria para poder aceptar, solo se
                          puede adjuntar una vez):
                        </div>
                        {!idSolicitud && (
                          <div className="text-xs text-rose-600">
                            No se encontró una solicitud de facturación asociada a
                            esta cotización. Primero crea la solicitud para poder
                            adjuntar la factura.
                          </div>
                        )}
                        {idSolicitud && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={handleFacturaChange}
                              className="block w-full text-xs text-slate-600
                            file:mr-3 file:py-1.5 file:px-3
                            file:rounded-md file:border-0
                            file:text-xs file:font-semibold
                            file:bg-slate-100 file:text-slate-700
                            hover:file:bg-slate-200"
                            />
                            <button
                              type="button"
                              onClick={handleSubirFactura}
                              disabled={isSubiendoFactura || !facturaFile}
                              className="btn btn-sm border bg-white text-success"
                            >
                              {isSubiendoFactura
                                ? "Subiendo factura…"
                                : "Facturar"}
                            </button>
                          </div>
                        )}
                        {facturaFile && (
                          <div className="text-xs text-slate-500">
                            Archivo seleccionado:{" "}
                            <span className="font-medium">
                              {facturaFile.name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

              </>
            )}

            {/* Observaciones crédito: SOLO si NO es contado (incluye crédito normal y de terceros) */}
            {!esContado && (
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-base font-semibold text-slate-900.mb-2">
                    Observaciones del crédito:
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-slate-800 space-y-1.5">
                    <li>
                      Crédito aprobado por{" "}
                      <span className="font-semibold">{financiador}</span>
                    </li>
                    <li>
                      Cuota inicial:{" "}
                      <span className="font-semibold">
                        {fmtCOP(cuota_inicial)}
                      </span>
                    </li>
                    <li>
                      Saldo a financiar:{" "}
                      <span className="font-semibold">
                        {fmtCOP(saldoFinanciar)}
                      </span>
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* 🔹 Contado o Crédito de terceros: si YA hay factura y aún NO es final -> panel de descuentos / contraentrega */}
            {debeMostrarDescuentosPanel && (
              <DescuentosContraentregaPanel idSolicitud={idSolicitud!} />
            )}

            {/* 🔹 DocumentosSolicitud:
                - Contado / Crédito de terceros: cuando is_final = 1
                - Crédito normal: cuando ya hay factura e idSolicitud (sin pasar por descuentos) */}
            {debeMostrarDocumentosSolicitud && (
              <DocumentosSolicitud
                id_factura={Number(id_cotizacion)}
                id={id_cotizacion}
                idSolicitud={idSolicitud}
                idCotizacion={id_cotizacion}
                tiene_factura={tieneFactura}
                docs={{
                  manifiesto_url: manifiestoUrlFinal,
                  cedula_url: cedulaUrlFinal,
                  factura_url: facturaUrlFinal,
                  carta_url: cartaUrlFinal,
                  otros_documentos: otrosDocsUrls,
                }}
                onVolver={() => {
                  volverAtras();
                }}
                finalizado={finalizadoActaRaw}
                estadoCotizacion={estadoCotizacion}
                onDocumentUploaded={() => refetch()}
                onAprobado={() => {
                  if (!tieneFactura) {
                    alert.warn(
                      "Falta la factura",
                      "Para aprobar/aceptar es obligatorio que exista una factura adjunta."
                    );
                    return;
                  }
                  refetch();
                }}
              />
            )}

            {/* Botones: ir al acta, recargar, PDF */}
            <section className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Revisa la información, descarga el soporte en PDF o consulta el
                acta de entrega.
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/solicitudes/actas/final/${id_cotizacion}`}
                  className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-violet-600"
                >
                  Ver acta de entrega
                </Link>

                <PDFDownloadLink
                  fileName={`solicitud_factura_${codigoSolicitud}.pdf`}
                  document={
                    <SolicitudFacturaPDF2
                      // 👇 NUEVO: empresa + logo dinámico
                      empresa={empresaPDF}
                      logoDataUrl={logoUrl}

                      // ENCABEZADO
                      codigoFactura={codigoSolicitud || ""}
                      codigoCredito={cred?.codigo_credito ?? ""}
                      fecha={fmtFecha(fechaCreacion)}
                      agencia={cot?.canal_contacto ?? ""}

                      // DEUDOR
                      cedula={clienteDocumento || ""}
                      nombre={clienteNombre || ""}
                      telefono={clienteTelefono || ""}
                      direccion={
                        cot?.direccion_residencia ??
                        sol?.direccion_residencia ??
                        ""
                      }

                      // DETALLE DE LA VENTA
                      reciboPago={
                        numeroReciboSolicitud ??
                        (cot as any)?.numero_recibo ??
                        ""
                      }
                      motocicleta={marcaLinea || ""}
                      modelo={
                        pick<string>(
                          sol?.modelo,
                          (pickMotoField("modelo") as string | undefined),
                          cot?.modelo_a
                        ) ?? ""
                      }
                      numeroMotor={numeroMotor || ""}
                      numeroChasis={numeroChasis || ""}
                      color={color || ""}

                      // CONDICIONES DEL NEGOCIO
                      cn_valor_moto={cn_total}
                      cn_descuento={-Math.abs(descuentos)} // el descuento normal (ya incluido)
                      cn_desc_auto={-(descuentoAutorizadoTotal || 0)} // autorizado + contraentrega
                      cn_valorMotoDesc={cn_total} // ya viene con la resta aplicada

                      cn_valorBruto={cn_bruto}
                      cn_iva={cn_iva}
                      cn_total={cn_total}

                      // DOCUMENTOS
                      soat={soat}
                      matricula={matricula}
                      impuestos={impuestos}

                      // ACCESORIOS / SEGUROS
                      accesorios_bruto={accesorios_bruto}
                      accesorios_iva={acc_iva_accesorios}
                      accesorios_total={accesorios_total}
                      seguros_total={seguros_total}

                      // TOTAL GENERAL
                      totalGeneral={totalGeneral}
                    />
                  }
                >
                  {({ loading }) => (
                    <button
                      className="btn btn-sm bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
                      disabled={loading || loadingEmpresa} // opcional, para esperar empresa
                    >
                      {loading ? "Generando…" : "Descargar PDF"}
                    </button>
                  )}
                </PDFDownloadLink>

              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default DetallesFacturacion;
