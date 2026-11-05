"use client";

import { CheckCircle2, Copy, Package, Truck, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatFCFA, formatDateLong } from "@/lib/format";
import { useShop } from "@/lib/store";
import { Reveal } from "./Reveal";

export function OrderSuccessView() {
  const lastOrder = useShop((s) => s.lastOrder);
  const resetToHome = useShop((s) => s.resetToHome);
  const openCatalog = useShop((s) => s.openCatalog);

  if (!lastOrder) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-[#123d29]">
          Aucune commande à afficher
        </h1>
        <Button
          className="rounded-full bg-[#e8842c] font-extrabold hover:bg-[#d9741f]"
          onClick={resetToHome}
        >
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(lastOrder.id);
      toast({ title: "Numéro copié", description: lastOrder.id });
    } catch {
      toast({
        title: "Copie impossible",
        description: `Notez votre numéro : ${lastOrder.id}`,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 lg:py-16">
      <Reveal>
        <div className="rounded-3xl border border-[#e6ddc9] bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e4efe4]">
            <CheckCircle2 className="h-10 w-10 text-[#1b5e3f]" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold text-[#123d29]">
            Merci {lastOrder.name.split(" ")[0]} !
          </h1>
          <p className="mt-2 text-muted-foreground">
            Votre commande a bien été enregistrée. Notre équipe vous appelle
            pour confirmer la livraison à {lastOrder.city}.
          </p>

          <div className="mt-6 rounded-2xl bg-[#f2ecdf]/70 p-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Numéro de commande
                </p>
                <p className="text-xl font-extrabold text-[#1b5e3f]">
                  {lastOrder.id}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#d9cfba]"
                onClick={copyId}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copier
              </Button>
            </div>

            <Separator className="my-4" />

            <dl className="grid gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-bold">
                  {formatDateLong(new Date(lastOrder.createdAt))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Montant total</dt>
                <dd className="font-extrabold text-[#1b5e3f]">
                  {formatFCFA(lastOrder.total)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Paiement</dt>
                <dd className="font-bold">{lastOrder.paymentLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd className="text-right font-bold">{lastOrder.deliveryZone}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-[#e6ddc9] p-4">
              <Package className="h-5 w-5 text-[#e8842c]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">1. Préparation</p>
              <p className="text-xs text-muted-foreground">
                Nous rassemblons vos articles et vérifions chaque produit.
              </p>
            </div>
            <div className="rounded-xl border border-[#e6ddc9] p-4">
              <Phone className="h-5 w-5 text-[#e8842c]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">2. Appel de confirmation</p>
              <p className="text-xs text-muted-foreground">
                Un appel ou un message WhatsApp au {lastOrder.phone}.
              </p>
            </div>
            <div className="rounded-xl border border-[#e6ddc9] p-4">
              <Truck className="h-5 w-5 text-[#e8842c]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">3. Livraison</p>
              <p className="text-xs text-muted-foreground">
                Suivez notre livreur jusqu&apos;à votre porte.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full bg-[#1b5e3f] px-7 font-extrabold hover:bg-[#14503a]"
              onClick={resetToHome}
            >
              Retour à l&apos;accueil
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-[#e8842c] px-7 font-bold text-[#b05f14] hover:bg-[#f8e8d4]"
              onClick={() => openCatalog("all")}
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
