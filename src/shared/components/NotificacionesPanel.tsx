import React, { useRef, useEffect, useState } from 'react';
import { Bell, Construction } from 'lucide-react';

const NotificacionesPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="indicator">
        <span className="indicator-item badge badge-error badge-xs top-0 right-0" />
        <button
          className="btn btn-ghost btn-circle"
          aria-label="Notificaciones"
          title="Notificaciones"
          onClick={() => setOpen((v) => !v)}
        >
          <Bell className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div
        className={`
          absolute right-0 top-12 z-50 w-80 rounded-2xl border border-base-200 bg-white shadow-xl
          transition-all duration-200 origin-top-right
          ${open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
          <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
          <span className="badge badge-ghost badge-sm">0</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
          <Construction className="w-10 h-10 text-amber-400" />
          <p className="text-sm font-medium text-slate-700">En desarrollo</p>
          <p className="text-xs text-slate-400">
            Las notificaciones estarán disponibles próximamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificacionesPanel;
