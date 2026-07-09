// src/features/actas/components/EstadoVacio.tsx
import React from "react";
import { AlertCircle, FileText } from "lucide-react";

type Variant = "error" | "warning" | "info";

const variantConfig: Record<
  Variant,
  {
    icon: React.ElementType;
    border: string;
    bg: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
  }
> = {
  error: {
    icon: AlertCircle,
    border: "border-error/30",
    bg: "bg-base-100",
    iconColor: "text-error",
    titleColor: "text-error",
    textColor: "text-base-content/70",
  },
  warning: {
    icon: AlertCircle,
    border: "border-warning/30",
    bg: "bg-warning/10",
    iconColor: "text-warning",
    titleColor: "text-warning",
    textColor: "text-warning",
  },
  info: {
    icon: FileText,
    border: "border-info/30",
    bg: "bg-base-100",
    iconColor: "text-info",
    titleColor: "text-info",
    textColor: "text-base-content/70",
  },
};

const EstadoVacio: React.FC<{
  variant: Variant;
  titulo: string;
  children: React.ReactNode;
}> = ({ variant, titulo, children }) => {
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div
        className={`max-w-lg w-full rounded-2xl border ${cfg.border} ${cfg.bg} shadow-lg px-5 py-4 flex gap-3`}
      >
        <Icon className={`w-5 h-5 ${cfg.iconColor} mt-1`} />
        <div className="space-y-1">
          <h2 className={`text-sm font-semibold ${cfg.titleColor}`}>
            {titulo}
          </h2>
          <p className={`text-sm ${cfg.textColor}`}>{children}</p>
        </div>
      </div>
    </main>
  );
};

export default EstadoVacio;
