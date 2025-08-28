// src/components/ui/ButtonLink.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type ButtonLinkProps = {
  to: string;                
  label: string;             
  icon?: React.ReactNode;    
  variant?: 'green' | 'blue' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  direction?: 'forward' | 'back'; // 👈 nuevo prop para elegir dirección
};

const ButtonLink: React.FC<ButtonLinkProps> = ({
  to,
  label,
  icon,
  variant = 'green',
  size = 'md',
  className = '',
  direction = 'forward',
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
      : 'btn  btn-success'; 

  const arrowIcon =
    direction === 'back' ? (
      <ChevronLeft className="w-4 h-4 opacity-70 transition-transform group-hover:-translate-x-0.5" />
    ) : (
      <ChevronRight className="w-4 h-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
    );

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
      {direction === 'back' && arrowIcon}
      {icon && <span className="transition-transform">{icon}</span>}
      <span className="font-semibold">{label}</span>
      {direction === 'forward' && arrowIcon}
    </Link>
  );
};

export default ButtonLink;
