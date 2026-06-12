// src/components/home/Home.tsx
import React from "react";
import { LayoutDashboard, FileText, CreditCard } from "lucide-react";
import CotizacionesKPIs from "../features/dash/CotizacionesKPIs";
import CreditosKPIs from "../features/dash/CreditosKPIs";

const Home: React.FC = () => {
  const hoy = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="w-full bg-gradient-to-b from-base-200/40 to-transparent">
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-base-200 bg-gradient-to-br from-primary/10 via-base-100 to-info/10 p-6 sm:p-8 shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-info/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content">
                  Panel de control
                </h1>
                <p className="mt-1 text-sm text-base-content/60 first-letter:uppercase">
                  {hoy}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-base-200 bg-base-100/80 px-4 py-2 text-sm font-medium text-base-content/70 backdrop-blur">
                <FileText className="h-4 w-4 text-accent" />
                Cotizaciones
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-base-200 bg-base-100/80 px-4 py-2 text-sm font-medium text-base-content/70 backdrop-blur">
                <CreditCard className="h-4 w-4 text-primary" />
                Créditos
              </span>
            </div>
          </div>
        </header>

        <CotizacionesKPIs refetchInterval={60_000} />

        <div className="divider my-2" />

        <CreditosKPIs refetchInterval={60_000} />

        <footer className="pt-2 text-center text-xs text-base-content/50">
          © {new Date().getFullYear()} — MotosParaTodos · Panel de administración
        </footer>
      </section>
    </main>
  );
};

export default Home;
