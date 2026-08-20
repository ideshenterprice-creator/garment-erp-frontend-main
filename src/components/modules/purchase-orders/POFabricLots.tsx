import { Plus } from "lucide-react";
import { format } from "date-fns";
import type { POFabricLot } from "@/mock/purchaseOrders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface POFabricLotsProps {
  lots: POFabricLot[];
  fabricNeededKg: number;
}

export function POFabricLots({ lots, fabricNeededKg }: POFabricLotsProps) {
  const received = lots
    .filter((lot) => lot.status === "RECEIVED")
    .reduce((sum, lot) => sum + lot.quantityKg, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-slate-900">Fabric Allocation</h2>
        <p className="text-sm text-muted-foreground">
          Total fabric needed:{" "}
          <span className="font-semibold text-slate-900">{fabricNeededKg} kg</span>
          <span className="mx-2 text-slate-300">·</span>
          Received:{" "}
          <span className="font-semibold text-slate-900">{received} kg</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {lots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fabric lots linked yet.</p>
        ) : (
          lots.map((lot) => (
            <div
              key={lot.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{lot.lotNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {lot.supplierName} · {format(new Date(lot.date), "dd MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  {lot.quantityKg} kg
                </p>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    lot.status === "RECEIVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  )}
                >
                  {lot.status === "RECEIVED" ? "RECEIVED" : "TO PURCHASE"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Button type="button" variant="outline" className="mt-4" size="sm">
        <Plus className="size-4" />
        Link New Fabric Lot
      </Button>
    </div>
  );
}
