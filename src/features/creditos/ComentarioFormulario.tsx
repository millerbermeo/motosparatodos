import React from "react";
import { useRegistrarComentarioCredito } from "../../services/comentariosServices";
import { useModalStore } from "../../store/modalStore";
import { useAuthStore } from "../../store/auth.store";



type Props = {
  codigo_credito: string | number;
};

const ComentarioFormulario: React.FC<Props> = ({ codigo_credito }) => {
  const { user } = useAuthStore();
  const close = useModalStore((s) => s.close);
  const registrar = useRegistrarComentarioCredito();

  const [comentario, setComentario] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const isEmpty = comentario.trim().length === 0;
  const maxLen = 280;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (isEmpty || registrar.isPending) return;

    registrar.mutate(
      {
        codigo_credito,
        nombre_usuario: user?.name ?? "—",
        rol_usuario: user?.rol ?? "—",
        comentario: comentario.trim(),
      },
      {
        onSuccess: () => {
          // el hook ya hace invalidate + Swal
          close(); // cierra el modal al terminar
        },
      }
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Solo un input text como pediste */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text text-sm font-medium">Comentario</span>
          <span className="label-text-alt text-xs">
            {comentario.length}/{maxLen}
          </span>
        </div>

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Escribe tu comentario…"
          value={comentario}
          maxLength={maxLen}
          onChange={(e) => setComentario(e.target.value)}
          onBlur={() => setTouched(true)}
          disabled={registrar.isPending}
        />

        {touched && isEmpty && (
          <div className="label">
            <span className="label-text-alt text-error">
              El comentario no puede estar vacío.
            </span>
          </div>
        )}
      </label>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => close()}
          disabled={registrar.isPending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary text-primary-content"
          disabled={registrar.isPending || isEmpty}
        >
          {registrar.isPending ? "Guardando…" : "Registrar"}
        </button>
      </div>
    </form>
  );
};

export default ComentarioFormulario;
