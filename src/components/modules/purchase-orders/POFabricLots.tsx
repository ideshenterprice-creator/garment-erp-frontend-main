"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { POFabricLot, PurchaseBillStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface POFabricLotsProps {
  lots: POFabricLot[];
  fabricNeededKg: number;
  totalFabricReceived?: number;
  poId: string;
}

function lotStatusMeta(status: PurchaseBillStatus) {
  if (status === "CONFIRMED") {
    return {
      label: "RECEIVED",
      className: "bg-emerald-100 text-emerald-700",
      muted: false,
    };
  }
  if (status === "RETURNED") {
    return {
      label: "RETURNED",
      className: "bg-rose-100 text-rose-700",
      muted: false,
    };
  }
  return {
    label: "TO PURCHASE",
    className: "bg-amber-100 text-amber-800",
    muted: true,
  };
}

export function POFabricLots({
  lots,
  fabricNeededKg,
  totalFabricReceived,
  poId,
}: POFabricLotsProps) {
  const router = useRouter();
  const received =
    totalFabricReceived ??
    lots
      .filter((lot) => lot.status === "CONFIRMED")
      .reduce((sum, lot) => sum + Number(lot.netWeight), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-slate-900">Fabric Allocation</h2>
        <p className="text-sm text-muted-foreground">
          Total fabric needed:{" "}
          <span className="font-semibold text-slate-900">
            {Number(fabricNeededKg).toLocaleString("en-IN")} kg
          </span>
          <span className="mx-2 text-slate-300">·</span>
          Received:{" "}
          <span className="font-semibold text-slate-900">
            {Number(received).toLocaleString("en-IN")} kg
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {lots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fabric lots linked yet.</p>
        ) : (
          lots.map((lot) => {
            const meta = lotStatusMeta(lot.status);
            return (
              <div
                key={lot.billId}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                  meta.muted
                    ? "border-dashed border-slate-300 bg-slate-50/60"
                    : "border-slate-200"
                )}
              >
                <div>
                  <p className="font-medium text-slate-900">
                    Lot {lot.lotNumber}
                    {lot.billNumber ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({lot.billNumber})
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Link
                      href={`/masters/party/${lot.supplier.id}`}
                      className="text-[#1b3a3a] hover:underline"
                    >
                      {lot.supplier.name}
                    </Link>{" "}
                    · {format(new Date(lot.date), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {Number(lot.netWeight).toLocaleString("en-IN")} kg
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      meta.className
                    )}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        size="sm"
        onClick={() =>
          router.push(`${ROUTES.PURCHASE.NEW}?poId=${poId}`)
        }
      >
        <Plus className="size-4" />
        Link New Fabric Lot
      </Button>
    </div>
  );
}
