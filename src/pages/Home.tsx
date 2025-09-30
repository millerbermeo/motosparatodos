// src/components/home/Home.tsx
import React from "react";
import CotizacionesKPIs from "../features/dash/CotizacionesKPIs";
import CreditosKPIs from "../features/dash/CreditosKPIs";

const Home: React.FC = () => {

  return (
    <main className="w-full">

      <section className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">


        <CotizacionesKPIs
          refetchInterval={60_000}
        />



        <CreditosKPIs
          refetchInterval={60_000}
        />

        <div className="text-center text-sm text-base-content/60">
          © {new Date().getFullYear()} — Dashboard (Motos para todos).
        </div>
      </section>
    </main>
  );
};


export default Home;
