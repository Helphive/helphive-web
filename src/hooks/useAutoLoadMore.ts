import { useEffect, useRef } from 'react';

// Returns a ref for a sentinel element; calls onReach whenever it scrolls into view.
export function useAutoLoadMore(onReach: () => void, enabled: boolean) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const callbackRef = useRef(onReach);

    useEffect(() => {
        callbackRef.current = onReach;
    });

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !enabled || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) callbackRef.current();
            },
            { rootMargin: '200px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [enabled]);

    return sentinelRef;
}
