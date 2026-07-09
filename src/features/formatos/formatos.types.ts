// src/features/formatos/formatos.types.ts

export type UiFormato = {
  id: number | string;
  title: string; // name
  ruta: string; // docs_formatos/archivo.docx
  size?: string;
  date?: string;
};
