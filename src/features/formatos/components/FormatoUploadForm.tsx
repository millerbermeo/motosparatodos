// src/features/formatos/components/FormatoUploadForm.tsx
import React from "react";
import { validateFileInput } from "../../../utils/fileValidation";

const FormatoUploadForm: React.FC<{
  name: string;
  onNameChange: (name: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}> = ({ name, onNameChange, onFileChange, onSubmit, isPending }) => (
  <form
    onSubmit={onSubmit}
    className="w-full bg-base-100 border border-base-300 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-end"
  >
    <div className="form-control w-full md:max-w-sm">
      <label className="label">
        <span className="label-text">Nombre del formato</span>
      </label>
      <input
        type="text"
        placeholder="Ej. CONTRATO DE DACIÓN EN PAGO"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
    <div className="form-control w-full md:max-w-md">
      <label className="label">
        <span className="label-text">Archivo</span>
      </label>
      <input
        id="file-input"
        type="file"
        className="file-input file-input-bordered w-full"
        onChange={(e) => {
          if (!validateFileInput(e)) return onFileChange(null);
          onFileChange(e.target.files?.[0] ?? null);
        }}
        accept=".doc,.docx,.pdf,.xlsx,.pptx"
      />
    </div>
    <button
      type="submit"
      className={`btn btn-primary md:self-end ${isPending ? "btn-disabled" : ""}`}
    >
      {isPending ? <span className="loading loading-spinner mr-2" /> : null}
      Registrar
    </button>
  </form>
);

export default FormatoUploadForm;
