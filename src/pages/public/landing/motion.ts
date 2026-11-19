import { useEffect, useState, type CSSProperties, type MouseEvent, type RefObject } from 'react';
import { HEADER_HEIGHT } from './constants';

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Smoothly scrolls to a landing section (instantly with reduced motion), then moves focus to it. */
export function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
    window.history.replaceState(null, '', `#${id}`);
    return true;
}

/** Click handler for in-page `#id` links. */
export function handleHashClick(event: MouseEvent<HTMLElement>, href: string) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (scrollToSection(href.replace(/^#/, ''))) event.preventDefault();
}

/** True once the page has scrolled past `offset` pixels. */
export function useScrolled(offset = 4) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const update = () => setScrolled(window.scrollY > offset);
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, [offset]);
    return scrolled;
}

/** The id of the section that currently sits under the sticky header, if any. */
export function useActiveSection(ids: readonly string[]) {
    const [active, setActive] = useState<string | null>(null);
    const key = ids.join(',');
    useEffect(() => {
        const sections = key
            .split(',')
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => Boolean(el));
        if (!sections.length || !('IntersectionObserver' in window)) return;
        const visible = new Set<string>();
        // A thin band just below the header: whichever section crosses it is "current".
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) =>
                    entry.isIntersecting
                        ? visible.add(entry.target.id)
                        : visible.delete(entry.target.id)
                );
                setActive(sections.find((s) => visible.has(s.id))?.id ?? null);
            },
            { rootMargin: `-${HEADER_HEIGHT + 1}px 0px -60% 0px` }
        );
        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, [key]);
    return active;
}

/**
 * Eases `[data-reveal]` elements in as they enter the viewport.
 * Elements are only hidden by this hook, after it has armed an observer for them, and never with
 * reduced motion, so content is visible whenever the animation cannot run. Children get a stagger
 * from `data-reveal-index`.
 */
export function useReveal(root: RefObject<HTMLElement>) {
    useEffect(() => {
        const el = root.current;
        if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
        const fold = window.innerHeight;
        const targets = [...el.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
            (t) => t.getBoundingClientRect().top > fold * 0.9
        );
        const show = (t: HTMLElement) => t.setAttribute('data-reveal', 'shown');
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    show(entry.target as HTMLElement);
                    observer.unobserve(entry.target);
                }),
            { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
        );
        targets.forEach((t) => {
            t.setAttribute('data-reveal', 'hidden');
            observer.observe(t);
        });
        const showAll = () => targets.forEach(show);
        window.addEventListener('beforeprint', showAll);
        return () => {
            observer.disconnect();
            window.removeEventListener('beforeprint', showAll);
            showAll();
        };
    }, [root]);
}

/** Styles for the page root that drive `useReveal`. */
export const revealStyles = {
    '& [data-reveal]': {
        transition:
            'opacity 520ms cubic-bezier(0.2, 0.7, 0.2, 1), transform 520ms cubic-bezier(0.2, 0.7, 0.2, 1)',
        transitionDelay: 'calc(var(--reveal-index, 0) * 70ms)',
    },
    '& [data-reveal="hidden"]': { opacity: 0, transform: 'translateY(14px)' },
    '& [data-reveal="hidden"] [data-reveal-child]': { opacity: 0, transform: 'translateY(10px)' },
    '& [data-reveal-child]': {
        transition:
            'opacity 480ms cubic-bezier(0.2, 0.7, 0.2, 1), transform 480ms cubic-bezier(0.2, 0.7, 0.2, 1)',
        transitionDelay: 'calc(120ms + var(--reveal-index, 0) * 80ms)',
    },
    '@media (prefers-reduced-motion: reduce)': {
        '& [data-reveal], & [data-reveal-child]': { transition: 'none' },
        '& [data-reveal="hidden"], & [data-reveal="hidden"] [data-reveal-child]': {
            opacity: 1,
            transform: 'none',
        },
    },
} as const;

/** Props for a staggered child inside a revealed block. */
export const revealChild = (index: number) =>
    ({ 'data-reveal-child': '', style: { '--reveal-index': index } as CSSProperties }) as const;
