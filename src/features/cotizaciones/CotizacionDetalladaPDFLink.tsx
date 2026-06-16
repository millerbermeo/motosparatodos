import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { CotizacionDetalladaPDFDoc } from "./CotizacionDetalladaPDFDoc";

// Encapsula el enlace de descarga del PDF de cotización.
// Se carga con React.lazy desde DetalleCotizacion para que react-pdf
// no entre en el chunk inicial de esa ruta.
type Props = {
  payloadParaPDF: any;
  ge?: any;
  logoUrl?: string;
  empresa: any;
  creditoDirecto?: any;
  fileName: string;
  disabled?: boolean;
};

const CotizacionDetalladaPDFLink: React.FC<Props> = ({
  payloadParaPDF,
  ge,
  logoUrl,
  empresa,
  creditoDirecto,
  fileName,
  disabled,
}) => {
  return (
    <PDFDownloadLink
      document={
        <CotizacionDetalladaPDFDoc
          cotizacion={{ success: true, data: payloadParaPDF }}
          garantiaExt={ge ? { success: true, data: ge } : undefined}
          logoUrl={logoUrl}
          empresa={empresa}
          creditoDirecto={creditoDirecto}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <button
          className="btn btn-success btn-sm"
          type="button"
          disabled={loading || disabled}
          title="Descargar PDF cotización"
        >
          <FileDown className="w-4 h-4" />
          {loading ? "Generando PDF…" : "PDF Cotización"}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default CotizacionDetalladaPDFLink;
