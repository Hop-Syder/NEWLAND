"use client";

import { PackageCheck, Clock3 } from "lucide-react";
import type { Availability } from "@/lib/products";

export function AvailabilityBadge({
  availability,
  leadTimeDays,
}: {
  availability: Availability;
  leadTimeDays?: number;
}) {
  if (availability === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0b0b0b] px-2.5 py-1 text-xs font-bold text-white">
        <PackageCheck className="h-3.5 w-3.5 text-[#d4af37]" aria-hidden="true" />
        En stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#d4af37] px-2.5 py-1 text-xs font-bold text-[#0b0b0b]">
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      Sur commande{leadTimeDays ? ` · ${leadTimeDays} j` : ""}
    </span>
  );
}
