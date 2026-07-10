// src/pages/Ayuda.tsx
import React from "react";
import { Mail, Clock, Globe } from "lucide-react";
import ContactCard from "../features/ayuda/components/ContactCard";
import CopyButton from "../shared/components/CopyButton";
import SupportCallout from "../features/ayuda/components/SupportCallout";
import WhatsAppIcon from "../features/ayuda/components/WhatsAppIcon";
import {
  WHATSAPP_NUM_DISPLAY,
  WHATSAPP_NUM_RAW,
  WHATSAPP_MESSAGE,
  MAIL,
  SITE,
} from "../features/ayuda/ayuda.constants";

const Ayuda: React.FC = () => {
  const waLink = `https://wa.me/${WHATSAPP_NUM_RAW}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`;

  return (
    <main
      className="w-full min-h-screen bg-linear-to-b from-base-200 via-base-200 to-base-100"
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

      {/* GRID DE CONTACTO */}
      <section className="w-full px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <ContactCard
            icon={<WhatsAppIcon className="w-6 h-6 text-success" />}
            iconBg="bg-success/10"
            title="WhatsApp"
          >
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-lg break-all"
              aria-label={`Abrir WhatsApp a ${WHATSAPP_NUM_DISPLAY}`}
            >
              {WHATSAPP_NUM_DISPLAY}
            </a>
            <div className="card-actions justify-between pt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm"
              >
                Escribir por WhatsApp
              </a>
              <CopyButton text={WHATSAPP_NUM_DISPLAY} />
            </div>
          </ContactCard>

          <ContactCard
            icon={<Mail className="w-6 h-6 text-info" />}
            iconBg="bg-info/10"
            title="Correo"
          >
            <a
              href={`mailto:${MAIL}?subject=${encodeURIComponent(
                "Soporte técnico"
              )}&body=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              className="link link-primary text-lg break-all"
            >
              {MAIL}
            </a>
            <div className="card-actions justify-between pt-2">
              <a
                href={`mailto:${MAIL}?subject=${encodeURIComponent(
                  "Soporte técnico"
                )}`}
                className="btn btn-info btn-sm"
              >
                Enviar correo
              </a>
              <CopyButton text={MAIL} />
            </div>
          </ContactCard>

          <ContactCard
            icon={<Clock className="w-6 h-6 text-warning" />}
            iconBg="bg-warning/10"
            title="Horario de atención"
          >
            <p className="text-base leading-relaxed">
              <span className="font-medium">Lunes a Viernes</span> de 8:00
              a.m. a 5:00 p.m.
            </p>
            <div className="pt-1">
              <span className="badge badge-ghost">Zona horaria Colombia</span>
            </div>
          </ContactCard>

          <ContactCard
            icon={<Globe className="w-6 h-6 text-primary" />}
            iconBg="bg-primary/10"
            title="Sitio web"
          >
            <a
              href={SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-lg break-all"
            >
              {SITE}
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
          </ContactCard>
        </div>
      </section>

      {/* CTA Soporte */}
      <section className="w-full px-4 md:px-8 pb-16">
        <SupportCallout />
      </section>
    </main>
  );
};

export default Ayuda;
