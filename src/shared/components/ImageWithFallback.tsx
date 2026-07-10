// src/shared/components/ImageWithFallback.tsx
import React from "react";
import { ImageOff } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
  onClick?: () => void;
};

/** Muestra la imagen si hay src y carga bien; si no hay src o falla, un ícono de reemplazo. */
export const ImageWithFallback: React.FC<Props> = ({ src, alt, className = "", iconSize = 20, onClick }) => {
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setErrored(false);
  }, [src]);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onClick={onClick}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-base-200 text-base-content/30 ${className}`}
      onClick={onClick}
      title={alt}
    >
      <ImageOff className="shrink-0" size={iconSize} />
    </div>
  );
};
