"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Factory, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { mockPurchaseBills, type MockPurchaseBill } from "@/mock/purchase";
import { BillStatusBadge } from "@/components/modules/purchase/BillStatusBadge";
import { BillDetailCard } from "@/components/modules/purchase/BillDetailCard";
import { StockUpdateInfo } from "@/components/modules/purchase/StockUpdateInfo";
import {
  PaymentHistory,
  PaymentStatusCard,
} from "@/components/modules/purchase/PaymentHistory";
import { ReturnBillDialog } from "@/components/modules/purchase/ReturnBillDialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

interface BillDetailPageProps {
  billId: string;
}

export function BillDetailPage({ billId }: BillDetailPageProps) {
  const router = useRouter();
  const initial = useMemo(
    () => mockPurchaseBills.find((bill) => bill.id === billId) ?? null,
    [billId]
  );
  const [bill, setBill] = useState<MockPurchaseBill | null>(initial);
  const [returnOpen, setReturnOpen] = useState(false);

  if (!bill) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <h1 className="text-lg font-semibold">Purchase bill not found</h1>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => router.push(ROUTES.PURCHASE.BILLS)}
        >
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.PURCHASE.BILLS)}
            className="mt-1 rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 md:text-[28px]">
                Purchase Bill — {bill.billNumber}
              </h1>
              <BillStatusBadge status={bill.status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Factory className="size-3.5" />
              {bill.supplier.name} —{" "}
              {format(new Date(bill.purchaseDate), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        {bill.status === "CONFIRMED" ? (
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setReturnOpen(true)}
          >
            <Undo2 className="size-4" />
            Return Bill
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <BillDetailCard bill={bill} />
        </div>
        <div className="flex flex-col gap-4">
          <StockUpdateInfo bill={bill} />
          <PaymentStatusCard bill={bill} />
        </div>
      </div>

      <PaymentHistory bill={bill} />

      <ReturnBillDialog
        open={returnOpen}
        billNumber={bill.billNumber}
        onClose={() => setReturnOpen(false)}
        onConfirm={() => {
          setBill({ ...bill, status: "RETURNED" });
          toast.success("Bill returned successfully");
        }}
      />
    </div>
  );
}
