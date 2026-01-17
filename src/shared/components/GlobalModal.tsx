import { useEffect } from "react";
import { X } from "lucide-react";
import { useModalStore } from "../../store/modalStore";

type ModalSize =
  | "sm" | "md" | "lg" | "xl" | "2xl"
  | "3xl" | "4xl" | "5xl"
  | "full"
  | { width?: string; height?: string; maxHeight?: string };

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
      return "w-screen h-screen max-w-none m-0 rounded-none";
    default:
      return "w-11/12 max-w-lg";
  }
};

export default function GlobalModal() {
  const {
    isOpen,
    title,
    content,
    close,
    size = "lg",
    position = "center",
  } = useModalStore() as any;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const positionClass =
    position === "top"
      ? "modal-top"
      : position === "bottom"
      ? "modal-bottom"
      : "modal-middle";

  const scrollClasses = "max-h-[80vh] overflow-y-auto";

  return (
    <div className={`modal ${positionClass} ${isOpen ? "modal-open" : ""}`} role="dialog">
      <div
        className={`modal-box relative ${sizeToClasses(size)} ${
          size === "full" ? "" : scrollClasses
        }`}
      >
        {/* ❌ BOTÓN CERRAR */}
        <button
          type="button"
          onClick={close}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {title ? <h3 className="text-lg font-bold mb-2 pr-8">{title}</h3> : null}

        {content}
      </div>

      {/* backdrop */}
      <div className="modal-backdrop" onClick={close} />
    </div>
  );
}
