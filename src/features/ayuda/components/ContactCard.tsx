// src/features/ayuda/components/ContactCard.tsx
import React from "react";

const ContactCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, iconBg, title, children }) => (
  <article className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="card-body">
      <div className="flex items-center gap-3">
        <span className={`inline-flex p-2 rounded-lg ${iconBg}`}>{icon}</span>
        <h2 className="card-title text-base">{title}</h2>
      </div>
      {children}
    </div>
  </article>
);

export default ContactCard;
