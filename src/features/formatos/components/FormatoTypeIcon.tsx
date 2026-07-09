// src/features/formatos/components/FormatoTypeIcon.tsx
import React from "react";

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity=".2" />
    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h3" />
  </svg>
);

const WordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
    <path d="M28 4h8l8 8v28a4 4 0 0 1-4 4H28z" opacity=".15" />
    <path d="M28 4v12h12M8 10h16v28H8z" opacity=".2" />
    <path d="M12 18h4l2 10 2-10h4l2 10 2-10h4" />
  </svg>
);

const WORD_EXTENSIONS = ["doc", "docx"];

// Ícono según la extensión del archivo: Word para .doc/.docx, genérico para el resto.
const FormatoTypeIcon: React.FC<{ ext: string; className?: string }> = ({
  ext,
  className,
}) =>
  WORD_EXTENSIONS.includes(ext) ? (
    <WordIcon className={className} />
  ) : (
    <FileIcon className={className} />
  );

export default FormatoTypeIcon;
