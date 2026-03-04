import React from "react";
import ReporteCotizacionesCard from "../shared/components/contado-terceros/reportes/ReporteCotizacionesCard";
import ReporteCreditosCard from "../shared/components/contado-terceros/reportes/ReporteCreditosCard";

const Reportes: React.FC = () => {
  return (
    <main className="w-full">
      {/* Header */}
      <section className="w-full bg-base-200">
        <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold">Reportes</h1>
          <p className="text-base-content/70">
            Descarga de reportes en Excel.
          </p>
        </div>
      </section>

      {/* Cards de reportes */}
      <section className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Reporte de Cotizaciones */}
        <ReporteCotizacionesCard />

        {/* Reporte de Créditos */}
        <ReporteCreditosCard />

      </section>
    </main>
  );
};

export default Reportes;