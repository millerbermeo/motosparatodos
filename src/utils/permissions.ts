// src/utils/permissions.ts
export function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .toLowerCase()
    .trim();
}

export function hasModuleNormalized(userModules: string[] | undefined | null, required?: string) {
  if (!required) return true; // no exige módulo
  if (!userModules?.length) return false;
  const req = normalize(required);
  return userModules.some((m) => normalize(m) === req);
}

export function hasRoleNormalized(userRole?: string, required?: string) {
  if (!required) return true; // no exige rol
  if (!userRole) return false;
  return normalize(userRole) === normalize(required);
}
