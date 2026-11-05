"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

/**
 * Image distante robuste : affiche un état de remplacement élégant
 * si la photo n'est pas disponible.
 */
export function SafeImg({
  src,
  alt,
  className = "",
  sizesHint,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizesHint?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-[linear-gradient(135deg,#efe7d6_0%,#f8f3e7_55%,#f6e3c9_100%)] text-[#8a8163] ${className}`}
        title={sizesHint}
      >
        <ImageOff className="h-7 w-7 opacity-60" aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
