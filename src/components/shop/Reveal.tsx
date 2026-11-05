"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number; // ms
}

/**
 * Apparition douce à l'entrée dans le viewport (IntersectionObserver).
 * Respecte prefers-reduced-motion : le contenu est immédiatement visible.
 */
export function Reveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const dirClass =
    direction === "left"
      ? "reveal-left"
      : direction === "right"
        ? "reveal-right"
        : "";

  return (
    <div
      ref={ref}
      className={`reveal ${dirClass} ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Léger effet de parallaxe : déplace l'élément verticalement au défilement.
 * Désactivé si prefers-reduced-motion.
 */
export function useParallax(strength = 0.18) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const offset = (rect.top + rect.height / 2 - viewportCenter) * strength;
        node.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return ref;
}
