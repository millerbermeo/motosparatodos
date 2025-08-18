// src/components/steps.tsx
import React from 'react';
import InfoPersonalFormulario from './forms/InfoPersonalFormulario';
import CoodeudoresFormulario from './forms/CoodeudoresFormulario';
import InfoProductoFormulario from './forms/InfoProductoFormulario';
import SolicitudFormulario from './forms/SolicitudFormulario';
import SoporteFormulario from './forms/SoporteFormulario';

export const PasoInfoPersonal: React.FC = () => (
    <div className="space-y-2">

        <InfoPersonalFormulario />

    </div>
);

export const PasoCodeudores: React.FC = () => (
    <div className="space-y-2">
       <CoodeudoresFormulario />
    </div>
);

export const PasoProducto: React.FC = () => (
    <div className="space-y-2">
        <InfoProductoFormulario  />
    </div>
);

export const PasoFirmas: React.FC = () => (
    <div className="space-y-2">
        <SolicitudFormulario />
    </div>
);

export const PasoSoportes: React.FC = () => (
    <div className="space-y-2">
        <SoporteFormulario />
    </div>
);
