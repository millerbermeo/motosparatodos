import React, { useMemo, useState, useCallback } from 'react';

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
  const firstId = steps[0]?.id;
  const [activeId, setActiveId] = useState<string>(initialStepId ?? firstId);

  const idx = Math.max(0, steps.findIndex((s) => s.id === activeId));
  const isFirst = idx <= 0;
  const isLast = idx >= steps.length - 1;

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= steps.length) return;
      const nextId = steps[i].id;
      setActiveId(nextId);
      onChangeStep?.(nextId);
    },
    [steps, onChangeStep]
  );

  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;
    return Math.round((idx / (steps.length - 1)) * 100);
  }, [idx, steps.length]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'Home')       { e.preventDefault(); goTo(0); }
    if (e.key === 'End')        { e.preventDefault(); goTo(steps.length - 1); }
  };

  const ActiveContent = steps[idx]?.Content ?? (() => null);
  const progressPct = progress; // 0–100

  return (
    <section className={`w-full ${className}`} aria-label="Asistente" onKeyDown={onKeyDown}>
      {/* Encabezado */}
      <div className="mb-6 max-w-full mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm opacity-70">
            Paso <span className="font-semibold">{idx + 1}</span> de {steps.length}
          </div>
          <progress className="progress progress-success w-64 md:w-80" value={progress} max={100} />
        </div>
      </div>

      {/* Timeline continua */}
      <div className="max-w-full mx-auto">
        <div className="relative px-2 pt-8 pb-4">
          {/* Línea base continua */}
          <div className="absolute inset-x-0 top-[55px] h-[3px] bg-base-300 rounded-full" />
          {/* Progreso (continua desde el inicio hasta el paso actual) */}
          <div
            className="absolute left-0 top-[55px] h-[3px] bg-success rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
          {/* Nodos */}
          <ol className="relative z-10 flex items-center justify-between gap-2">
            {steps.map((s, i) => {
              const isDone = i < idx;
              const isCurrent = i === idx;

              const dotClasses = [
                'w-12 h-12 rounded-full flex items-center justify-center cursor-pointer select-none',
                'ring-2 transition-all hover:shadow-md',
                isDone
                  ? 'bg-success text-success-content ring-success'
                  : isCurrent
                  ? 'bg-base-100 text-success ring-success'
                  : 'bg-base-100 text-base-content/60 ring-base-300',
                'focus:outline-none focus-visible:ring-4 focus-visible:ring-success/20',
              ].join(' ');

              return (
                <li key={s.id} className="flex flex-col items-center min-w-[140px]">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={s.title}
                    tabIndex={0}
                    className={dotClasses}
                    onClick={() => goTo(i)}
                    onKeyDown={(e) => e.key === 'Enter' && goTo(i)}
                  >
                    {/* icono del paso */}
                    <s.icon className={isCurrent ? 'w-6 h-6 text-success' : 'w-6 h-6'} />
                  </button>
                  <span
                    className={[
                      'mt-2 text-center text-xs md:text-sm',
                      isCurrent ? 'font-semibold text-success' : isDone ? 'text-base-content/80' : 'text-base-content/50',
                    ].join(' ')}
                  >
                    {s.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Panel de contenido */}
      <div className="mt-6 max-full mx-auto card bg-base-100 border border-base-300/60 shadow-sm">
        <div className="card-body">
          <ActiveContent />
        </div>
      </div>

      {/* Controles */}
      <div className="mt-4 max-full mx-auto flex items-center justify-between">
        <button className="btn btn-ghost" onClick={prev} disabled={isFirst}>
          ← Anterior
        </button>
        {!isLast ? (
          <button className="btn btn-primary" onClick={next}>
            Siguiente →
          </button>
        ) : (
          <button className="btn btn-success">Finalizar</button>
        )}
      </div>
    </section>
  );
};

export default WizardTimeline;
