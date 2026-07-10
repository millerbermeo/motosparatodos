// src/features/formatos/components/DownloadToast.tsx
import React from "react";

const DownloadToast: React.FC<{ title: string; onClose: () => void }> = ({
  title,
  onClose,
}) => (
  <div className="toast toast-end z-50">
    <div className="alert shadow-lg bg-base-100 border border-base-300/60">
      <span className="loading loading-spinner loading-md" aria-hidden="true" />
      <div>
        <h3 className="font-semibold">Descargando…</h3>
        <p className="text-sm opacity-80 line-clamp-1">{title}</p>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={onClose}>
        Cerrar
      </button>
    </div>
  </div>
);

export default DownloadToast;
