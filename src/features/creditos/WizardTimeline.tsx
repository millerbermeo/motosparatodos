import React, { useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWizardStore } from '../../store/wizardStore';
import { useCreditoProgreso } from '../../services/creditoProgresoService';
import { useCredito } from '../../services/creditosServices';
import { esWizardSoloLectura, esWizardSinRevision } from '../../utils/creditoEstado';
import { alert } from '../../utils/alerts';

export type Step = {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  Content: React.FC;
};

type WizardProps = {
  steps: Step[];
  initialStepId?: string;
  onChangeStep?: (stepId: string) => void;
  className?: string;
};

const WizardTimeline: React.FC<WizardProps> = ({
  steps,
  initialStepId,
  onChangeStep,
  className = '',
}) => {
  const {  setSteps, idx, goTo, setReadOnly, setBloqueaRevision } = useWizardStore();
  const activeId = useWizardStore(s => s.activeId);
  const readOnly = useWizardStore(s => s.readOnly);

  // credito_id viene de la ruta /creditos/registrar/:id
  const { id: creditoId } = useParams<{ id: string }>();
  const { data: progreso, refetch: refetchProgreso } = useCreditoProgreso(creditoId);

  // estado del crédito: Facturado/En Facturación (o crédito cerrado) → wizard
  // de solo lectura; Aprobado → se puede seguir editando, pero ya no puede
  // volver a "Revision"
  const { data: creditoResp } = useCredito(
    { codigo_credito: creditoId ?? '' },
    !!creditoId
  );
  const creditoActual = creditoResp?.success && creditoResp.creditos?.length
    ? creditoResp.creditos[0]
    : undefined;
  const estadoCredito = creditoActual?.estado;
  const creditoCerrado = creditoActual?.credito_cerrado;

  useEffect(() => {
    setReadOnly(esWizardSoloLectura(estadoCredito, creditoCerrado));
    setBloqueaRevision(esWizardSinRevision(estadoCredito));
  }, [estadoCredito, creditoCerrado, setReadOnly, setBloqueaRevision]);

  // refrescar progreso cuando cambia el paso (un form pudo completar el paso en backend)
  useEffect(() => {
    if (creditoId) refetchProgreso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, creditoId]);

  // ¿paso índice (0-based) completo? → lee paso_{idx+1}_completo del backend
  const pasoCompleto = useCallback(
    (stepIndex: number): boolean => {
      if (!progreso) return false;
      const key = `paso_${stepIndex + 1}_completo` as keyof typeof progreso;
      return Boolean(progreso[key]);
    },
    [progreso]
  );

  // primer paso incompleto en [0, i-1]; -1 si todos los anteriores están completos
  const firstIncompleteBefore = useCallback(
    (i: number): number => {
      for (let j = 0; j < i; j++) {
        if (!pasoCompleto(j)) return j;
      }
      return -1;
    },
    [pasoCompleto]
  );

  // ¿se puede navegar al paso índice i desde el timeline?
  // retroceder o quedarse: libre.
  // últimos dos pasos (Solicitud y firmas, Soportes): siempre libres.
  // avanzar al resto: requiere los pasos anteriores completos.
  const canGoTo = useCallback(
    (i: number): boolean => {
      // Solo lectura: toda la línea de tiempo queda libre para consultar.
      if (readOnly) return true;
      if (i <= idx) return true;
      if (i >= steps.length - 2) return true;
      return firstIncompleteBefore(i) === -1;
    },
    [idx, firstIncompleteBefore, steps.length, readOnly]
  );

  // goTo gateado: solo aplica al click en iconos del timeline
  const handleGoTo = useCallback(
    (i: number) => {
      if (canGoTo(i)) {
        goTo(i);
        return;
      }
      // hay un paso anterior sin completar → llevar a ese paso y avisar
      const blocker = firstIncompleteBefore(i);
      const stepName = steps[blocker]?.title ?? '';
      const msg =
        blocker === 0
          ? 'Completa los datos de Información personal'
          : `Completa el paso anterior: ${stepName}`;

      if (blocker !== idx) goTo(blocker);
      alert.warn('Paso bloqueado', msg);
    },
    [canGoTo, firstIncompleteBefore, goTo, idx, steps]
  );

  // montar/actualizar steps en el store
  useEffect(() => {
    setSteps(steps.map(s => s.id), initialStepId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(steps.map(s => s.id)), initialStepId]);

    // ✅ scroll arriba cuando cambia el step
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // o behavior: 'auto'
  }, [idx]); // también podrías usar [activeId]
  
  // notificar cambios al padre (opcional)
  useEffect(() => {
    if (onChangeStep && activeId) onChangeStep(activeId);
  }, [activeId, onChangeStep]);

  const ActiveContent = steps[idx]?.Content ?? (() => null);

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;
    return Math.round((idx / (steps.length - 1)) * 100);
  }, [idx, steps.length]);

  return (
    <section className={`w-full ${className}`} aria-label="Asistente">
      {/* Encabezado */}
      <div className="mb-6 max-w-full mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm opacity-70">
            Paso <span className="font-semibold">{idx + 1}</span> de {steps.length}
          </div>
          <progress className="progress progress-success w-64 md:w-80" value={progress} max={100} />
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-full mx-auto">
        <div className="relative px-2 pt-8 pb-4">
          <div className="absolute inset-x-0 top-13.75 h-0.75 bg-base-300 rounded-full" />
          <div className="absolute left-0 top-13.75 h-0.75 bg-success rounded-full transition-all duration-300"
               style={{ width: `${progress}%` }} />
          <ol className="relative z-10 flex items-center justify-between gap-2">
            {steps.map((s, i) => {
              const isDone = i < idx;
              const isCurrent = i === idx;
              const isLocked = !canGoTo(i);
              const dotClasses = [
                'w-12 h-12 rounded-full flex items-center justify-center select-none',
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md',
                'ring-2 transition-all',
                isDone
                  ? 'bg-success text-success-content ring-success'
                  : isCurrent
                  ? 'bg-base-100 text-success ring-success'
                  : 'bg-base-100 text-base-content/60 ring-base-300',
                'focus:outline-none focus-visible:ring-4 focus-visible:ring-success/20',
              ].join(' ');

              return (
                <li key={s.id} className="flex flex-col items-center min-w-35">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-disabled={isLocked}
                    aria-label={s.title}
                    tabIndex={0}
                    className={dotClasses}
                    onClick={() => handleGoTo(i)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGoTo(i)}
                  >
                    <s.icon className={isCurrent ? 'w-6 h-6 text-success' : 'w-6 h-6'} />
                  </button>
                  <span className={['mt-2 text-center text-xs md:text-sm',
                    isCurrent ? 'font-semibold text-success' : isDone ? 'text-base-content/80' : 'text-base-content/50',
                  ].join(' ')}>
                    {s.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Panel */}
      <div className="mt-6 max-full mx-auto card bg-base-100 border border-base-300/60 shadow-sm">
        <div className="card-body">
          <ActiveContent />
        </div>
      </div>

      {/* ⛔️ Sin controles globales: la navegación la dispara el formulario */}
    </section>
  );
};

export default WizardTimeline;
