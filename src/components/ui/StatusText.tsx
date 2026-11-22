/**
 * Semantic status typography without pill enclosures.
 * Always communicates state with explicit text (never color alone).
 */

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'text-[#34D399]',
  warning: 'text-[#FBBF24]',
  danger: 'text-[#FB7185]',
  neutral: 'text-[#94A3B8]',
  brand: 'text-[#C4B5FD]',
};

export interface StatusTextProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

export function StatusText({ label, tone = 'neutral', className = '' }: StatusTextProps) {
  return (
    <span className={`text-xs font-medium tracking-wide ${TONE_CLASSES[tone]} ${className}`}>
      {label}
    </span>
  );
}

export function getGameStatusTone(status: string): StatusTone {
  switch (status) {
    case 'published':
    case 'approved':
    case 'completed':
    case 'open':
      return 'success';
    case 'pending_review':
    case 'in_development':
    case 'upcoming':
    case 'scheduled':
      return 'warning';
    case 'changes_requested':
    case 'rejected':
    case 'suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}
