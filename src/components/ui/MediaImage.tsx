import { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { isSafeImageUrl } from '../../lib/urlSafety';

export interface MediaImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackTitle: string;
  aspectClass?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Determines whether the currently supplied image source matches the previously failed source.
 * Matching against the active src prevents stale error states when src changes on reused instances.
 */
export function isMediaImageFailed(
  src: string | null | undefined,
  failedSrc: string | null
): boolean {
  return Boolean(src && failedSrc !== null && failedSrc === src);
}

/**
 * Resilient media renderer satisfying 06_UI_UX_SPECIFICATION.md and Zero-Broken-Image policy.
 * Displays an explicit styled fallback artwork surface if an external or missing image fails.
 */
export function MediaImage({
  src,
  alt,
  fallbackTitle,
  aspectClass = 'aspect-video',
  className = '',
  priority = false,
}: MediaImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  const isSourceSafe = src ? isSafeImageUrl(src) : false;
  const failed = isMediaImageFailed(src, failedSrc);
  const showFallback = !src || !isSourceSafe || failed;

  return (
    <div
      className={`relative overflow-hidden bg-[#14141D] ${aspectClass} ${className}`}
    >
      {showFallback ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1A162B] via-[#13131E] to-[#0D0D14] p-6 text-center"
        >
          <Gamepad2 className="h-7 w-7 text-[#C4B5FD]/70" aria-hidden="true" />
          <p className="max-w-[24ch] text-xs font-medium text-[#B8B8CA]">{fallbackTitle}</p>
          <span className="text-[11px] text-[#8E8EA6]">Cover artwork unavailable</span>
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src ?? null)}
          className="h-full w-full scale-[1.06] object-cover transition-transform duration-300 group-hover:scale-[1.09]"
        />
      )}
    </div>
  );
}
