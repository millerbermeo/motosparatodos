// src/utils/officeViewer.ts
import { getFileExtension } from './files';

// Extensiones que Office Online sabe previsualizar; el resto se abre directo.
const OFFICE_VIEWER_EXTENSIONS = ['doc', 'docx', 'xlsx', 'pptx'];

// Dada una URL absoluta, devuelve la URL a usar en un <a target="_blank">
// para "ver" el archivo: si es un formato Office, pasa por el visor de
// Office Online; si no, devuelve la misma URL (el navegador la maneja).
export const getOfficeViewerUrl = (absoluteUrl: string): string => {
  const ext = getFileExtension(absoluteUrl);
  if (OFFICE_VIEWER_EXTENSIONS.includes(ext)) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`;
  }
  return absoluteUrl;
};
