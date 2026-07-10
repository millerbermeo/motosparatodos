import Swal from "sweetalert2";

// Tamaño máximo permitido: 1.5 MB
export const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1572864 bytes
export const MAX_FILE_SIZE_LABEL = "1.5 MB";

// Tipos permitidos: imágenes, PDF, Word, Excel. NO videos/audios.
export const ALLOWED_MIME_TYPES = [
  // Imágenes
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/heic",
  "image/heif",
  // PDF
  "application/pdf",
  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const ALLOWED_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif",
  "pdf",
  "doc", "docx",
  "xls", "xlsx", "csv",
  "ppt", "pptx",
];

// attribute accept para inputs <input type="file" accept={ACCEPT_ATTR} />
export const ACCEPT_ATTR =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const getExt = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const isVideoOrAudio = (file: File) => {
  const t = (file.type || "").toLowerCase();
  return t.startsWith("video/") || t.startsWith("audio/");
};

const isAllowedType = (file: File) => {
  const ext = getExt(file.name);
  const t = (file.type || "").toLowerCase();
  // Si el navegador reporta mime, validar; si no, validar por extensión
  if (t) return ALLOWED_MIME_TYPES.includes(t);
  return ALLOWED_EXTENSIONS.includes(ext);
};

/**
 * Valida un archivo: tipo permitido + tamaño <= 1.5 MB.
 * Devuelve { ok } y, si falla, muestra SweetAlert2 con el motivo.
 */
export const validateFile = (file: File): { ok: boolean } => {
  if (isVideoOrAudio(file) || !isAllowedType(file)) {
    Swal.fire({
      icon: "error",
      title: "Archivo no permitido",
      text: "Solo se permiten imágenes, PDF, Word y Excel.",
    });
    return { ok: false };
  }

  if (file.size > MAX_FILE_SIZE) {
    Swal.fire({
      icon: "error",
      title: "Archivo demasiado pesado",
      text: `El documento es demasiado pesado. Debe pesar menos de ${MAX_FILE_SIZE_LABEL}.`,
    });
    return { ok: false };
  }

  return { ok: true };
};

/**
 * Valida todos los archivos de un evento de <input type="file">.
 * Si alguno es inválido: muestra alerta, limpia el input y devuelve false.
 * Si todo OK (o no hay archivos): devuelve true.
 *
 * Úsalo al inicio del onChange del input. Si devuelve false, no continúes
 * con la lógica existente.
 */
/**
 * Envuelve el resultado de react-hook-form `register(...)` para validar el
 * archivo (tipo + tamaño) antes de delegar al onChange de RHF.
 * Uso: <input {...withFileValidation(register("campo", opts))} />
 */
export const withFileValidation = (reg: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => unknown;
  [k: string]: any;
}) => ({
  ...reg,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateFileInput(e)) return; // limpia y avisa si es inválido
    return reg.onChange(e);
  },
});

/**
 * Convierte un array de File a un FileList real (vía DataTransfer), para
 * escribir en campos de react-hook-form tipados como FileList (register + FileList).
 */
export const filesToFileList = (files: File[]): FileList => {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f));
  return dt.files;
};

export const validateFileInput = (
  e: React.ChangeEvent<HTMLInputElement>
): boolean => {
  const files = e.target.files;
  if (!files || files.length === 0) return true;

  for (const file of Array.from(files)) {
    const { ok } = validateFile(file);
    if (!ok) {
      e.target.value = ""; // limpiar para obligar a elegir otro
      return false;
    }
  }
  return true;
};
