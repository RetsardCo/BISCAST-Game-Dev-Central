import React from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:bg-[#5B21B6] border border-transparent',
  secondary:
    'bg-[#181822] text-[#F8F8FA] hover:bg-[#222230] border border-[#2E2E42]',
  ghost:
    'bg-transparent text-[#B8B8CA] hover:text-[#F8F8FA] hover:bg-[#181822] border border-transparent',
  danger:
    'bg-[#9F1239] text-white hover:bg-[#BE123C] border border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 py-1.5 text-xs',
  md: 'min-h-[42px] px-5 py-2.5 text-sm',
  lg: 'min-h-[48px] px-6 py-3 text-sm',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}

export interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
