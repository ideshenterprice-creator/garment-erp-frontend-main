"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isBefore, differenceInCalendarDays } from "date-fns";
import { Ban, Pencil } from "lucide-react";
import { toast } from "sonner";
import { mockPurchaseOrders, type MockPurchaseOrder } from "@/mock/purchaseOrders";
import { POStatusBadge } from "@/components/modules/purchase-orders/POStatusBadge";
import { PODetailCard } from "@/components/modules/purchase-orders/PODetailCard";
import { POItemsTable } from "@/components/modules/purchase-orders/POItemsTable";
import { POProductionProgress } from "@/components/modules/purchase-orders/POProductionProgress";
import { POFabricLots } from "@/components/modules/purchase-orders/POFabricLots";
import { POQuickActions } from "@/components/modules/purchase-orders/POQuickActions";
import { CancelPODialog } from "@/components/modules/purchase-orders/CancelPODialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { usePOStore } from "@/store/poStore";
import { cn } from "@/lib/utils";

interface PODetailPageProps {
  poId: string;
}

function calcProgress(order: MockPurchaseOrder): number {
  const stages = order.productionStages ?? [];
  if (stages.length === 0) return 0;
  const totalIssued = stages.reduce((sum, stage) => sum + stage.issued, 0);
  const totalDone = stages.reduce((sum, stage) => sum + stage.done, 0);
  if (totalIssued === 0) return 0;
  return Math.round((totalDone / totalIssued) * 100);
}

export function PODetailPage({ poId }: PODetailPageProps) {
  const router = useRouter();
  const setSelectedPO = usePOStore((state) => state.setSelectedPO);
  const initial = useMemo(
    () => mockPurchaseOrders.find((order) => order.id === poId) ?? null,
    [poId]
  );
  const [order, setOrder] = useState<MockPurchaseOrder | null>(initial);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!order) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <h1 className="text-lg font-semibold">Purchase order not found</h1>
        <Button
          type="button"
          className="mt-4"
          variant="outline"
          onClick={() => router.push(ROUTES.PURCHASE_ORDERS.ROOT)}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const deliveryDate = new Date(order.deliveryDate);
  const daysLeft = differenceInCalendarDays(deliveryDate, new Date());
  const deliveryWarning =
    isBefore(deliveryDate, new Date()) || daysLeft <= 45;

  const canCancel =
    order.status !== "COMPLETED" && order.status !== "CANCELLED";

  return (
    <div className="flex flex-col gap-6 pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 md:text-[28px]">
              {order.poNumber}
            </h1>
            <POStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.buyer.name}, {order.buyer.country} • Ordered{" "}
            {format(new Date(order.orderDate), "dd MMM yyyy")} •{" "}
            <span
              className={cn(
                "font-semibold",
                deliveryWarning ? "text-red-600" : "text-slate-700"
              )}
            >
              Deliver by {format(deliveryDate, "dd MMM yyyy")}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canCancel}
            onClick={() =>
              router.push(`${ROUTES.PURCHASE_ORDERS.DETAIL(order.id)}?edit=1`)
            }
          >
            <Pencil className="size-4" />
            Edit PO
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={!canCancel}
            onClick={() => {
              setSelectedPO(order.id);
              setCancelOpen(true);
            }}
          >
            <Ban className="size-4" />
            Cancel PO
          </Button>
        </div>
      </div>

      <PODetailCard order={order} />
      <POItemsTable items={order.items ?? []} />
      <POProductionProgress
        stages={
          order.productionStages ?? [
            {
              stage: "Cutting",
              issued: 0,
              done: 0,
              pending: 0,
              status: "PENDING",
            },
            {
              stage: "Printing",
              issued: 0,
              done: 0,
              pending: 0,
              status: "PENDING",
            },
            {
              stage: "Coloring",
              issued: 0,
              done: 0,
              pending: 0,
              status: "PENDING",
            },
            {
              stage: "Stitching",
              issued: 0,
              done: 0,
              pending: 0,
              status: "PENDING",
            },
            {
              stage: "Finishing",
              issued: 0,
              done: 0,
              pending: 0,
              status: "PENDING",
            },
          ]
        }
        progressPercent={calcProgress(order)}
      />
      <POFabricLots
        lots={order.fabricLots ?? []}
        fabricNeededKg={order.fabricNeededKg ?? 0}
      />

      <POQuickActions poId={order.id} />

      <CancelPODialog
        open={cancelOpen}
        poNumber={order.poNumber}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          setOrder({ ...order, status: "CANCELLED" });
          toast.success(`${order.poNumber} cancelled`);
        }}
      />
    </div>
  );
}
