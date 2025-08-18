

// src/pages/WizardDemo.tsx
import React from 'react';
import WizardTimeline, { type Step } from '../features/creditos/WizardTimeline';
import { UserIcon, UsersIcon, DocIcon, SignIcon, UploadIcon } from '../shared/components/icons';
import { PasoInfoPersonal, PasoCodeudores, PasoProducto, PasoFirmas, PasoSoportes } from '../features/creditos/steps';

const steps: Step[] = [
  { id: 'info', title: 'Información personal', icon: UserIcon, Content: PasoInfoPersonal },
  { id: 'codeu', title: 'Codeudores', icon: UsersIcon, Content: PasoCodeudores },
  { id: 'prod', title: 'Información del producto', icon: DocIcon, Content: PasoProducto },
  { id: 'firm', title: 'Solicitud y firmas', icon: SignIcon, Content: PasoFirmas },
  { id: 'supp', title: 'Soportes', icon: UploadIcon, Content: PasoSoportes },
];

const LineCreditos: React.FC = () => {
  return (
    <main className="w-full min-h-screen bg-base-100 p-4 md:p-8">
      <WizardTimeline
        steps={steps}
        initialStepId="info"
        onChangeStep={(id: any) => console.log('step ->', id)}
      />
    </main>
  );
};

export default LineCreditos;
