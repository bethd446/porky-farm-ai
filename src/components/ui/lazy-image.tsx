import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  skeletonClassName?: string;
}

/**
 * Composant d'image avec lazy loading et skeleton pendant le chargement
 * @param src - URL de l'image
 * @param alt - Texte alternatif
 * @param className - Classes CSS additionnelles
 * @param fallback - URL de l'image de fallback en cas d'erreur
 * @param skeletonClassName - Classes CSS pour le skeleton
 */
export function LazyImage({
  src,
  alt,
  className,
  fallback = '🐷',
  skeletonClassName,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  if (hasError && fallback && fallback.startsWith('🐷')) {
    return (
      <div
        ref={containerRef}
        className={cn('w-full h-full flex items-center justify-center text-6xl', className)}
        {...props}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full', className)}>
      {!isLoaded && (
        <Skeleton className={cn('absolute inset-0', skeletonClassName)} />
      )}
      {isInView && (
        <img
          ref={imgRef}
          src={hasError && fallback && !fallback.startsWith('🐷') ? fallback : src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

