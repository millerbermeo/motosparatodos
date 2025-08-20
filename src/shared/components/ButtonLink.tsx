// src/components/ui/ButtonLink.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type ButtonLinkProps = {
  to: string;                // ruta
  label: string;             // texto del botón
  icon?: React.ReactNode;    // ícono opcional al inicio
  variant?: 'green' | 'blue' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const ButtonLink: React.FC<ButtonLinkProps> = ({
  to,
  label,
  icon,
  variant = 'green',
  size = 'md',
  className = '',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-sm px-3 py-1.5'
      : size === 'lg'
      ? 'text-base px-5 py-3'
      : 'text-sm px-4 py-2';

  const variantClasses =
    variant === 'blue'
      ? 'bg-[#3498DB] hover:bg-[#2d86bf] text-white focus:ring-[#3498DB]'
      : variant === 'outline'
      ? 'bg-transparent border border-base-300 text-base-content hover:bg-base-200 focus:ring-base-300'
      : variant === 'ghost'
      ? 'bg-base-100 text-base-content hover:bg-base-200 focus:ring-base-300'
      : 'bg-[#2BB352] hover:bg-[#23a048] text-white focus:ring-[#2BB352]'; // green (default)

  return (
    <Link
      to={to}
      className={[
        'group inline-flex items-center gap-2 rounded-xl',
        'shadow-sm hover:shadow-md transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses,
        variantClasses,
        className,
      ].join(' ')}
    >
      {icon && <span className="transition-transform group-hover:-translate-x-0.5">{icon}</span>}
      <span className="font-semibold">{label}</span>
      <ChevronRight className="w-4 h-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

export default ButtonLink;
