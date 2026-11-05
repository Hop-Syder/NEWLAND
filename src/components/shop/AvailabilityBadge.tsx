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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4efe4] px-2.5 py-1 text-xs font-bold text-[#1b5e3f]">
        <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
        En stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8e8d4] px-2.5 py-1 text-xs font-bold text-[#b05f14]">
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      Sur commande{leadTimeDays ? ` · ${leadTimeDays} j` : ""}
    </span>
  );
}
