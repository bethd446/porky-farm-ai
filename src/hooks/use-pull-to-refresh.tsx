import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

/**
 * Hook pour implémenter le pull-to-refresh sur mobile
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const element = elementRef.current || window;
    let touchStartY = 0;
    let isScrolledToTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      isScrolledToTop = window.scrollY === 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolledToTop || !startY.current) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY;

      if (distance > 0 && isScrolledToTop) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && isPulling) {
        await onRefresh();
      }
      setIsPulling(false);
      setPullDistance(0);
      startY.current = null;
    };

    const handleScroll = () => {
      isScrolledToTop = window.scrollY === 0;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, disabled, isPulling, pullDistance]);

  return {
    isPulling,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
    elementRef,
  };
}

