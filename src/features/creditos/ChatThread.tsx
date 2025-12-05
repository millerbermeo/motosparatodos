import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useComentariosCredito } from "../../services/comentariosServices";
import { ShieldCheck, UserRound } from "lucide-react";

export interface ChatMessage {
  id: string | number;
  role: string; // rol tal como viene del backend
  name: string;
  comment: string;
  timestamp: string | number | Date;
  avatarUrl?: string;
}

interface ChatThreadProps {
  className?: string;
}

function formatDateEs(value: ChatMessage["timestamp"]) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

const roleStyles = {
  Asesor: {
    align: "chat-start" as const,
    bubble: "bg-base-200 text-base-content",
    name: "text-emerald-600",
    footer: "text-sky-500",
    ring: "ring-2 ring-emerald-400/70",
    iconColor: "text-emerald-600 dark:text-emerald-300",
    Icon: UserRound,
    label: "Asesor",
  },
  Administrador: {
    align: "chat-end" as const,
    bubble: "bg-sky-600 text-white",
    name: "text-sky-600 dark:text-sky-400",
    footer: "text-emerald-500",
    ring: "ring-2 ring-sky-400/70",
    iconColor: "text-sky-600 dark:text-sky-300",
    Icon: ShieldCheck,
    label: "Administrador",
  },
};

function Avatar({
  src,
  name,
  ring,
  iconColor,
  Icon,
  label,
}: {
  src?: string;
  name: string;
  ring: string;
  iconColor: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <div className="chat-image avatar">
      <div
        className={`w-10 h-10 rounded-full overflow-hidden pt-2 grid place-items-center ${ring}`}
        aria-label={`${label}: ${name}`}
        title={`${label}: ${name}`}
      >
        {src ? (
          <img src={src} alt={`Avatar de ${name}`} className="w-full h-full object-cover" />
        ) : (
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.25} />
        )}
      </div>
    </div>
  );
}

const ChatThread: React.FC<ChatThreadProps> = ({ className = "" }) => {
  const { id: codigoFromUrl } = useParams<{ id: string }>();
  const codigo_credito = String(codigoFromUrl ?? "");

  if (!codigo_credito) {
    return (
      <div className={`w-full max-full mx-auto p-6 ${className}`}>
        <div className="alert alert-warning">
          <span>
            Falta el parámetro <strong>?codigo_credito</strong> en la URL.
          </span>
        </div>
      </div>
    );
  }

  const { data, isLoading, error } = useComentariosCredito(codigo_credito, !!codigo_credito);

  console.log("messages", data);

  const messages: ChatMessage[] = useMemo(() => {
    return (data ?? []).map((c) => ({
      id: c.id,
      role: c.rol_usuario || "Asesor", // usamos el rol que viene del backend
      name: c.nombre_usuario || "Usuario",
      comment: c.comentario || "",
      timestamp: c.fecha_creacion || new Date().toISOString(),
    }));
  }, [data]);

  if (isLoading) return <div className="p-6">Cargando comentarios…</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <span>{(error as any)?.response?.data?.error || (error as any)?.message}</span>
        </div>
      </div>
    );
  if (!messages.length) return <div className="p-6 italic opacity-70">No hay comentarios</div>;

  // Ordenamos por fecha
  const sorted = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className={`w-full max-full mx-auto p-6 ${className}`}>
      {sorted.map((m) => {
        // Solo Administrador va a la derecha, el resto se pinta como "Asesor"
        const isAdmin = m.role === "Administrador";
        const s = isAdmin ? roleStyles.Administrador : roleStyles.Asesor;
        const dateLabel = formatDateEs(m.timestamp);

        return (
          <React.Fragment key={m.id}>
            {/* Fecha centrada al estilo WhatsApp */}
            <div className="flex justify-center my-4">
              <span className="px-3 py-0 rounded-full bg-white text-success text-xs font-medium">
                {dateLabel}
              </span>
            </div>

            <div className={`chat ${s.align}`}>
              <Avatar
                src={m.avatarUrl}
                name={m.name}
                ring={s.ring}
                iconColor={s.iconColor}
                Icon={s.Icon}
                label={s.label}
              />

              <div className="chat-header flex mt-2 mb-1 items-center gap-2">
                <span className={`font-semibold ${s.name}`}>{m.name}</span>

                {/* Mostrar rol tal como viene del backend */}
                <span className="text-xs opacity-70 italic">
                  ({m.role})
                </span>
              </div>

              <div className={`chat-bubble ${s.bubble}`}>
                {m.comment?.trim() || <span className="opacity-70 italic">(sin contenido)</span>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ChatThread;
