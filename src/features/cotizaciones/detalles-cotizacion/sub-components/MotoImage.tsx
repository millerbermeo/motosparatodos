import { Bike, X } from 'lucide-react';
import React from 'react'
import type { MotoImageProps } from '../detallesCotizacion.type';

const MotoImage: React.FC<MotoImageProps> = ({
    src,
    alt = "Imagen de la moto",
    thumbClassName = "w-24 h-24",
}) => {
    const [error, setError] = React.useState(false);
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const uid = React.useId();

    const showPlaceholder = !src || error;

    const openModal = () => {
        if (!showPlaceholder) {
            dialogRef.current?.showModal();
        }
    };

    const closeModal = () => dialogRef.current?.close();

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            {/* Thumb / disparador */}
            <button
                type="button"
                onClick={openModal}
                className={`hover:opacity-90 transition ${showPlaceholder ? "cursor-not-allowed" : "cursor-zoom-in"}`}
                aria-haspopup="dialog"
                aria-controls={`moto-modal-${uid}`}
                aria-disabled={showPlaceholder}
                title={showPlaceholder ? "Sin imagen" : "Ver imagen"}
            >
                <div className="rounded-xl border border-base-300/60 overflow-hidden bg-base-200 flex items-center justify-center p-2">
                    {showPlaceholder ? (
                        <div className="text-center p-4">
                            <Bike className="w-10 h-10 opacity-40 mx-auto mb-2" />
                            <p className="text-xs opacity-60">Aquí va la imagen de la moto</p>
                        </div>
                    ) : (
                        <img
                            src={src}
                            alt={alt}
                            className={`${thumbClassName} object-contain size-44`}
                            onError={() => setError(true)}
                            loading="lazy"
                        />
                    )}
                </div>
            </button>

            {/* Modal daisyUI */}
            <dialog ref={dialogRef} id={`moto-modal-${uid}`} className="modal">
                <div className="modal-box max-w-4xl p-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                        <h3 className="font-semibold text-base">{alt}</h3>
                        <button onClick={closeModal} className="btn btn-ghost btn-sm" aria-label="Cerrar">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-0">
                        {!showPlaceholder && (
                            <img
                                src={src}
                                alt={alt}
                                className="w-full h-auto max-h-[75vh] object-contain bg-base-200"
                                onError={() => setError(true)}
                            />
                        )}
                        {showPlaceholder && (
                            <div className="w-full h-[60vh] bg-base-200 flex flex-col items-center justify-center">
                                <Bike className="w-16 h-16 opacity-40 mb-3" />
                                <p className="opacity-70">No hay imagen disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
};


export default MotoImage