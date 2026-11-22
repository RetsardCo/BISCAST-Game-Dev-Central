import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { getPrivacyEnhancedYouTubeEmbedUrl } from '../../lib/urlSafety';
import { MediaImage } from './MediaImage';
import { Button } from './Button';

export interface YouTubeLazyEmbedProps {
  trailerUrl: string;
  posterUrl: string;
  title: string;
}

/**
 * Lazy-loaded privacy-enhanced YouTube player per 09_MEDIA_INTEGRATIONS.md:
 * - Renders cover poster before user clicks Play (zero autoplay, zero eager iframe network load).
 * - Always provides a safe direct YouTube watch fallback link.
 */
export function YouTubeLazyEmbed({ trailerUrl, posterUrl, title }: YouTubeLazyEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const embedUrl = getPrivacyEnhancedYouTubeEmbedUrl(trailerUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[#242433] bg-[#111118]">
        {isLoaded ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={`${title} — Trailer`}
              className="h-full w-full border-0"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full">
            <MediaImage
              src={posterUrl}
              alt={`${title} trailer poster`}
              fallbackTitle={title}
              aspectClass="aspect-video"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/80 via-black/45 to-black/25 p-6 text-center">
              <Button onClick={() => setIsLoaded(true)} aria-label={`Load trailer for ${title}`}>
                <Play className="h-4 w-4" aria-hidden="true" />
                Load YouTube Trailer
              </Button>
              <p className="text-xs text-[#D6D6E4]">
                Privacy-enhanced embed loads only when clicked. No autoplay.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-[#8E8EA6]">
        <span>Hosted externally on YouTube</span>
        <a
          href={trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#C4B5FD] hover:underline"
        >
          Watch directly on YouTube
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
