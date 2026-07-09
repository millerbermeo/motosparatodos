// src/utils/files.ts
import { BASE_URL } from './url';

export const toAbsoluteUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const root = (BASE_URL || "").replace(/\/+$/, "");
  const rel = String(path).replace(/^\/+/, "");

  return `${root}/${rel}`;
};

export const toAbsoluteUrlOrUndefined = (
  path?: string | null
): string | undefined => {
  return toAbsoluteUrl(path) ?? undefined;
};


export const getFotoUrl = (
  payload: any,
  lado: 'A' | 'B'
): string | undefined => {
  const key = `foto_${lado.toLowerCase()}`;
  return toAbsoluteUrlOrUndefined(payload?.[key]);
};

// Igual que toAbsoluteUrl, pero pensada para incrustar imágenes del backend en
// documentos generados (PDF/Word) client-side: encodea cada segmento de la ruta
// (nombres de archivo con espacios/comas) y, en dev, pasa por el proxy same-origin
// /__img (ver vite.config.ts) para evitar el bloqueo CORS del backend.
export const toEmbeddableImageUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  const rel = String(path)
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  if (import.meta.env.DEV) return `/__img/${rel}`;

  const root = (BASE_URL || '').replace(/\/+$/, '');
  return `${root}/${rel}`;
};

// Extensión en minúsculas de un nombre de archivo o URL (sin query string).
export const getFileExtension = (fileNameOrUrl: string): string => {
  const clean = fileNameOrUrl.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
};