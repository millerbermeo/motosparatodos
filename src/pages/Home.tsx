// src/components/home/Home.tsx
import React from "react";
import CotizacionesKPIs from "../features/dash/CotizacionesKPIs";
import CreditosKPIs from "../features/dash/CreditosKPIs";

const Home: React.FC = () => {

  return (
    <main className="w-full">

      <section className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="divider divider-success text-xl">Cotizaciones</div>

        <CotizacionesKPIs
          refetchInterval={60_000}
        />

               <div className="divider divider-success text-xl">Créditos</div>


        <CreditosKPIs
          refetchInterval={60_000}
        />

        <div className="text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Dashboard (demo).
        </div>
      </section>
    </main>
  );
};


export default Home;
