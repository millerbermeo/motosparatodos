// components/GlobalModal.tsx
import { useEffect } from "react";
import { useModalStore } from "../../store/modalStore";

type ModalSize =
  | "sm" | "md" | "lg" | "xl" | "2xl"
  | "3xl" | "4xl" | "5xl"
  | "full"               // pantalla completa
  | { width?: string; height?: string; maxHeight?: string }; // clases personalizadas

const sizeToClasses = (size: ModalSize) => {
  if (typeof size === "object") {
    const w = size.width ?? "";
    const h = size.height ?? "";
    const mh = size.maxHeight ?? "";
    return `${w} ${h} ${mh}`.trim();
  }
  switch (size) {
    case "sm":  return "w-11/12 max-w-sm";
    case "md":  return "w-11/12 max-w-md";
    case "lg":  return "w-11/12 max-w-lg";
    case "xl":  return "w-11/12 max-w-xl";
    case "2xl": return "w-11/12 max-w-2xl";
    case "3xl": return "w-11/12 max-w-3xl";
    case "4xl": return "w-11/12 max-w-4xl";
    case "5xl": return "w-11/12 max-w-5xl";
    case "full":
      // Modal a pantalla completa
      return "w-screen h-screen max-w-none m-0 rounded-none";
    default:
      return "w-11/12 max-w-lg"; // por defecto
  }
};

export default function GlobalModal() {
  // Puedes guardar el size en el store si quieres: const { size = "lg" } = useModalStore();
  const { isOpen, title, content, close, size = "lg", position = "center" } = useModalStore() as any;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Posición del modal (center/top/bottom) usando helpers de DaisyUI
  const positionClass =
    position === "top" ? "modal-top"
    : position === "bottom" ? "modal-bottom"
    : "modal-middle";

  // Altura/scroll del contenido dentro del modal
  const scrollClasses = "max-h-[80vh] overflow-y-auto"; // ajusta a gusto

  return (
    <div className={`modal ${positionClass} ${isOpen ? "modal-open" : ""}`} role="dialog">
      <div className={`modal-box ${sizeToClasses(size)} ${size === "full" ? "" : scrollClasses}`}>
        {title ? <h3 className="text-lg font-bold mb-2">{title}</h3> : null}
        {content}
        {/* <div className="modal-action">
          <button className="btn" onClick={close}>Cerrar</button>
        </div> */}
      </div>

      {/* backdrop: DaisyUI permite cerrar con botón, aquí lo manejamos con onClick */}
      <div className="modal-backdrop" onClick={close} />
    </div>
  );
}
