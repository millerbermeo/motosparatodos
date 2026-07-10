// src/shared/components/CopyButton.tsx
import React, { useState } from "react";

// Botón autocontenido: copia `text` al portapapeles y muestra "¡Copiado!"
// por 2s. No necesita estado externo, cada instancia maneja el suyo.
const CopyButton: React.FC<{ text: string; label?: string }> = ({
  text,
  label = "Copiar",
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn btn-ghost btn-sm"
      aria-live="polite"
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
};

export default CopyButton;
