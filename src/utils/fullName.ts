// src/utils/fullName.ts

type PersonNameFields = {
  name?: string | null;
  s_name?: string | null;
  last_name?: string | null;
  s_last_name?: string | null;
};

// Concatena nombre + segundo nombre + apellido + segundo apellido, colapsando
// espacios repetidos. Devuelve `fallback` si no queda ningún campo con valor.
export const buildFullName = (
  person: PersonNameFields | null | undefined,
  fallback = '—'
): string =>
  [person?.name, person?.s_name, person?.last_name, person?.s_last_name]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || fallback;
