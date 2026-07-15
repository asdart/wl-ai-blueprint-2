import { useEffect, useRef, useState } from "react";

/* ---------- shared animation helpers ---------- */

export const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* true once the referenced element scrolls into view (and stays true). under
   reduced motion it reports true immediately so nothing stays hidden. */
export function useInView<T extends HTMLElement>({
  rootMargin = "0px 0px -15% 0px",
  threshold = 0.2,
}: { rootMargin?: string; threshold?: number } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, threshold]);
  return { ref, inView };
}

/* counts a value up from 0 → target (easeOutCubic). the animation (re)starts
   whenever `active` becomes true, after an optional delay. */
export function useCountUp(
  target: number,
  {
    duration = 1000,
    delay = 0,
    active = true,
  }: { duration?: number; delay?: number; active?: boolean } = {},
) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const timer = window.setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay, active]);
  return value;
}
