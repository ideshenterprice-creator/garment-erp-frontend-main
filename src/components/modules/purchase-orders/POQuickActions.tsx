"use client";

import { useRouter } from "next/navigation";
import {
  Factory,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface POQuickActionsProps {
  poId: string;
  disabled?: boolean;
}

export function POQuickActions({ poId, disabled = false }: POQuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      label: "Record Purchase",
      icon: <ShoppingCart className="size-4" />,
      onClick: () => router.push(`${ROUTES.PURCHASE.NEW}?poId=${poId}`),
    },
    {
      label: "Go to Production",
      icon: <Factory className="size-4" />,
      onClick: () => router.push(ROUTES.PRODUCTION.ROOT),
    },
    {
      label: "View Inventory",
      icon: <Package className="size-4" />,
      onClick: () => router.push(ROUTES.INVENTORY.STOCK),
    },
    {
      label: "Create Sales Bill",
      icon: <Receipt className="size-4" />,
      onClick: () => router.push(`${ROUTES.SALES.NEW_BILL}?poId=${poId}`),
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-900">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="outline"
            className="justify-start"
            disabled={disabled}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
