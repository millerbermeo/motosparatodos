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

// Extensión en minúsculas de un nombre de archivo o URL (sin query string).
export const getFileExtension = (fileNameOrUrl: string): string => {
  const clean = fileNameOrUrl.split('?')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
};