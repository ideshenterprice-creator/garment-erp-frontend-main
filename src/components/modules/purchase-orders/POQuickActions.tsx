"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Factory, Package, Receipt, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface POQuickActionsProps {
  poId: string;
}

export function POQuickActions({ poId }: POQuickActionsProps) {
  const router = useRouter();

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white px-4 py-3 md:-mx-6 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Zap className="size-4 text-amber-500" />
          Quick Actions
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-slate-800 text-white hover:bg-slate-700"
            onClick={() => router.push(`${ROUTES.PURCHASE.NEW}?poId=${poId}`)}
          >
            <BookOpen className="size-4" />
            Record Purchase
          </Button>
          <Button
            type="button"
            className="bg-amber-500 text-white hover:bg-amber-600"
            onClick={() => router.push(ROUTES.PRODUCTION.ROOT)}
          >
            <Factory className="size-4" />
            Go to Production
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.INVENTORY.STOCK)}
          >
            <Package className="size-4" />
            View Inventory
          </Button>
          <Button
            type="button"
            className="bg-slate-800 text-white hover:bg-slate-700"
            onClick={() =>
              router.push(`${ROUTES.SALES.NEW_BILL}?poId=${poId}`)
            }
          >
            <Receipt className="size-4" />
            Create Sales Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
