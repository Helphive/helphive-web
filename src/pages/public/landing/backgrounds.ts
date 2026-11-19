import { color } from '@/theme/tokens';

// Decorative backgrounds drawn as tiny SVG data URIs so they stay crisp and cost nothing to load.
const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** Hexagon line pattern (the "hive"). Tile is 27.7 x 48 px. */
export const honeycombImage = (stroke: string = color.ink300) =>
    uri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="27.713" height="48" viewBox="0 0 27.713 48"><g fill="none" stroke="${stroke}" stroke-width="1"><path d="M13.856 0 27.713 8V24L13.856 32 0 24V8Z"/><path d="M13.856 32V48"/></g></svg>`
    );

/** Fine dot grid. */
export const dotsImage = (fill: string = color.ink300) =>
    uri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="1" cy="1" r="1" fill="${fill}"/></svg>`
    );

/** Fades a layer out away from a focal point so patterns never sit behind body text. */
export const fadeFrom = (position: string) =>
    `radial-gradient(ellipse 70% 80% at ${position}, black 0%, transparent 100%)`;

/** Soft coral wash used behind phones and the download band. */
export const coralWash = (position: string) =>
    `radial-gradient(ellipse 60% 90% at ${position}, ${color.coral100} 0%, transparent 70%)`;

/** Soft ground shadow under a phone: an ink ellipse that fades out. */
export const contactShadow = `radial-gradient(closest-side, rgba(16, 24, 40, 0.28), rgba(16, 24, 40, 0.1) 55%, transparent)`;

/** Lift shadow that follows a phone's transparent silhouette. */
export const phoneLift = 'drop-shadow(0 18px 28px rgba(16, 24, 40, 0.16))';

/** Ink section glow: a faint coral light from one corner. */
export const inkGlow = (position: string) =>
    `radial-gradient(ellipse 55% 70% at ${position}, rgba(255, 87, 64, 0.16) 0%, transparent 70%)`;
