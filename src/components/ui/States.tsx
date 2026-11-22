import React from 'react';
import { AlertCircle, FolderSearch, Info, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export function LoadingSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading content"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-xl border border-[#242433] bg-[#111118]"
        >
          <div className="aspect-video w-full animate-pulse bg-[#181822]" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#1E1E2C]" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-[#232334]" />
            <div className="h-3.5 w-full animate-pulse rounded bg-[#1A1A26]" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#1A1A26]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#242433] bg-[#111118] px-6 py-14 text-center">
      <FolderSearch className="h-8 w-8 text-[#8E8EA6]" aria-hidden="true" />
      <h3 className="mt-4 text-lg font-semibold text-[#F8F8FA]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#B8B8CA]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to load records',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-[#4C1D2E] bg-[#161018] px-6 py-12 text-center"
    >
      <AlertCircle className="h-8 w-8 text-[#FB7185]" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-semibold text-[#F8F8FA]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[#B8B8CA]">{description}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

export interface PrototypeNoticeProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PrototypeNotice({ title, description, action }: PrototypeNoticeProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#2E2A45] bg-[#12111D] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#C4B5FD]" aria-hidden="true" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-[#F8F8FA]">{title}</p>
          <p className="text-xs leading-relaxed text-[#B8B8CA]">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
