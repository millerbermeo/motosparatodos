// src/pages/Ayuda.tsx
import React, { useState } from 'react';

const Ayuda: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // no-op
    }
  };

  const WHATSAPP_NUM_DISPLAY = '+57 304 588 9061';
  const WHATSAPP_NUM_RAW = '573045889061';
  const MAIL = 'soporte@vozipcolombia.net.co';
  const SITE = 'https://vozipcolombia.net.co/';
  const SUPPORT_ANCHOR = 'https://vozipcolombia.net.co/#soporte';

  const waMessage = encodeURIComponent('Hola equipo VOZIP Colombia, necesito ayuda con…');

  return (
    <main
      className="w-full min-h-screen bg-gradient-to-b from-base-200 via-base-200 to-base-100"
      aria-labelledby="titulo-ayuda"
    >
      {/* HERO / HEADER */}
      <section className="w-full">
        <div className="px-4 md:px-8 w-full py-10 md:py-14">
          <div className="her w-full flex-col items-stretch gap-6">
            <div className="w-full">
              <h1
                id="titulo-ayuda"
                className="text-3xl md:text-4xl font-extrabold tracking-tight"
              >
                Centro de Ayuda y Soporte
              </h1>
              <p className="mt-3 text-base md:text-lg opacity-80">
                Si necesitas asistencia técnica o tienes alguna duda, puedes
                comunicarte con nosotros a través de los siguientes medios:
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DE CONTACTO (100% ancho; se adapta con columnas) */}
      <section className="w-full px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">

          {/* WhatsApp */}
          <article className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="inline-flex p-2 rounded-lg bg-success/10">
                  <WhatsAppIcon className="w-6 h-6 text-success" />
                </span>
                <h2 className="card-title text-base">WhatsApp</h2>
              </div>

              <a
                href={`https://wa.me/${WHATSAPP_NUM_RAW}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-lg break-all"
                aria-label={`Abrir WhatsApp a ${WHATSAPP_NUM_DISPLAY}`}
              >
                {WHATSAPP_NUM_DISPLAY}
              </a>

              <div className="card-actions justify-between pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUM_RAW}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-sm"
                >
                  Escribir por WhatsApp
                </a>
                <button
                  onClick={() => copy(WHATSAPP_NUM_DISPLAY, 'wa')}
                  className="btn btn-ghost btn-sm"
                  aria-live="polite"
                >
                  {copied === 'wa' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </article>

          {/* Correo */}
          <article className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="inline-flex p-2 rounded-lg bg-info/10">
                  <MailIcon className="w-6 h-6 text-info" />
                </span>
                <h2 className="card-title text-base">Correo</h2>
              </div>

              <a
                href={`mailto:${MAIL}?subject=${encodeURIComponent('Soporte técnico')}&body=${encodeURIComponent(
                  'Hola equipo VOZIP Colombia, necesito ayuda con…'
                )}`}
                className="link link-primary text-lg break-all"
              >
                {MAIL}
              </a>

              <div className="card-actions justify-between pt-2">
                <a
                  href={`mailto:${MAIL}?subject=${encodeURIComponent('Soporte técnico')}`}
                  className="btn btn-info btn-sm"
                >
                  Enviar correo
                </a>
                <button
                  onClick={() => copy(MAIL, 'mail')}
                  className="btn btn-ghost btn-sm"
                >
                  {copied === 'mail' ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </article>

          {/* Horario */}
          <article className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="inline-flex p-2 rounded-lg bg-warning/10">
                  <ClockIcon className="w-6 h-6 text-warning" />
                </span>
                <h2 className="card-title text-base">Horario de atención</h2>
              </div>

              <p className="text-base leading-relaxed">
                <span className="font-medium">Lunes a Viernes</span> de 8:00 a.m. a 5:00 p.m.
              </p>

              <div className="pt-1">
                <span className="badge badge-ghost">Zona horaria Colombia</span>
              </div>
            </div>
          </article>

          {/* Sitio web */}
          <article className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="inline-flex p-2 rounded-lg bg-primary/10">
                  <GlobeIcon className="w-6 h-6 text-primary" />
                </span>
                <h2 className="card-title text-base">Sitio web</h2>
              </div>

              <a
                href={SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary text-lg break-all"
              >
                https://vozipcolombia.net.co/
              </a>

              <div className="card-actions pt-2">
                <a
                  href={SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Visitar sitio
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* CTA Soporte */}
      <section className="w-full px-4 md:px-8 pb-16">
        <div className="alert bg-base-100/60 border border-base-300/60 shadow-sm">
          <div className="flex items-start gap-3 w-full flex-wrap">
            <span className="inline-flex p-2 rounded-lg bg-secondary/10">
              <SupportIcon className="w-6 h-6 text-secondary" />
            </span>
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-semibold">¿Necesitas algo más?</h3>
              <p className="opacity-80">
                También puedes visitar directamente la sección de <strong>Soporte</strong> en nuestra página.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={SUPPORT_ANCHOR}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ir a la sección de Soporte
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

/* ==== Íconos SVG inline (sin librerías) ==== */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46 0 .1 5.36.1 11.96c0 2.1.56 4.1 1.63 5.88L0 24l6.29-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.6 0 11.96-5.36 11.96-11.96 0-3.2-1.25-6.22-3.51-8.39zM12.07 21.3h-.01a9.3 9.3 0 0 1-4.74-1.3l-.34-.2-3.73.97.99-3.64-.22-.37a9.22 9.22 0 0 1-1.41-4.87c0-5.11 4.16-9.27 9.27-9.27 2.48 0 4.81.97 6.56 2.72a9.22 9.22 0 0 1 2.72 6.55c0 5.11-4.16 9.28-9.28 9.28z" />
    <path d="M17.27 14.2c-.23-.11-1.37-.68-1.58-.76-.21-.08-.36-.11-.52.11-.15.22-.6.75-.73.9-.13.15-.27.17-.5.06-.23-.11-.98-.36-1.86-1.12-.69-.61-1.16-1.36-1.3-1.59-.13-.23-.01-.35.1-.46.11-.11.23-.27.34-.4.11-.13.15-.23.23-.38.08-.15.04-.28-.02-.4-.06-.11-.52-1.26-.71-1.72-.18-.43-.37-.37-.52-.38h-.45c-.15 0-.4.06-.61.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.94 2.35.11.15 1.6 2.45 3.87 3.33.54.23.96.37 1.29.47.54.17 1.03.15 1.42.09.43-.06 1.37-.56 1.56-1.1.19-.54.19-1 .13-1.1-.06-.11-.21-.17-.44-.28z" />
  </svg>
);

const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 12 4 6.01V6h16ZM4 18V8.24l7.4 5.55a1 1 0 0 0 1.2 0L20 8.24V18H4Z" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 22a10 10 0 1 1 10-10 10.012 10.012 0 0 1-10 10Zm0-18a8 8 0 1 0 8 8 8.009 8.009 0 0 0-8-8Zm1 8V7a1 1 0 0 0-2 0v6a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 12Z" />
  </svg>
);

const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm7.938 9H16.9a15.54 15.54 0 0 0-1.2-5.045A8.02 8.02 0 0 1 19.938 11ZM12 4c.9 0 2.6 2.3 3.2 7H8.8c.6-4.7 2.3-7 3.2-7Zm-3.7.955A15.54 15.54 0 0 0 7.1 11H4.062A8.02 8.02 0 0 1 8.3 4.955ZM4.062 13H7.1a15.54 15.54 0 0 0 1.2 5.045A8.02 8.02 0 0 1 4.062 13ZM12 20c-.9 0-2.6-2.3-3.2-7h6.4c-.6 4.7-2.3 7-3.2 7Zm3.7-.955A15.54 15.54 0 0 0 16.9 13h3.038a8.02 8.02 0 0 1-4.238 6.045Z" />
  </svg>
);

const SupportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a10 10 0 0 0-10 10v3a3 3 0 0 0 3 3h1v-8H5a7 7 0 0 1 14 0h-1v8h1a3 3 0 0 0 3-3v-3A10 10 0 0 0 12 2Zm-1 13h2v2h-2v-2Zm0-8h2v6h-2V7Z" />
  </svg>
);

export default Ayuda;
