// src/features/ayuda/components/SupportCallout.tsx
import React from "react";
import { LifeBuoy } from "lucide-react";
import { SUPPORT_ANCHOR } from "../ayuda.constants";

const SupportCallout: React.FC = () => (
  <div className="alert bg-base-100/60 border border-base-300/60 shadow-sm">
    <div className="flex items-start gap-3 w-full flex-wrap">
      <span className="inline-flex p-2 rounded-lg bg-secondary/10">
        <LifeBuoy className="w-6 h-6 text-secondary" />
      </span>
      <div className="flex-1 min-w-60">
        <h3 className="font-semibold">¿Necesitas algo más?</h3>
        <p className="opacity-80">
          También puedes visitar directamente la sección de{" "}
          <strong>Soporte</strong> en nuestra página.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={SUPPORT_ANCHOR}
          className="btn btn-secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ir a la sección de Soporte
        </a>
      </div>
    </div>
  </div>
);

export default SupportCallout;
