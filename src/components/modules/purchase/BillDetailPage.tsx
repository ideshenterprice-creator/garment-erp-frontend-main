"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Factory, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
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
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import {
  confirmPurchaseBill,
  getPurchaseBillById,
  returnPurchaseBill,
} from "@/services/purchase.service";

interface BillDetailPageProps {
  billId: string;
}

export function BillDetailPage({ billId }: BillDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [returnOpen, setReturnOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.PURCHASE_BILLS, billId],
    queryFn: () => getPurchaseBillById(billId),
    enabled: Boolean(billId),
  });

  const bill = data?.data;

  const confirmMutation = useMutation({
    mutationFn: () => confirmPurchaseBill(billId),
    onSuccess: () => {
      toast.success("Bill confirmed. Stock updated.");
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PURCHASE_BILLS, billId],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_BILLS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to confirm bill."));
    },
  });

  const returnMutation = useMutation({
    mutationFn: (reason: string) => returnPurchaseBill(billId, reason),
    onSuccess: () => {
      toast.success("Bill returned.");
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PURCHASE_BILLS, billId],
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_BILLS,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STOCK });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PURCHASE_ORDERS,
      });
      setReturnOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to return bill."));
    },
  });

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-900">
          Could not load purchase bill
        </p>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!bill) {
    return (
      <EmptyState
        title="Purchase bill not found"
        description="This bill may have been removed or the link is invalid."
        actionLabel="Back to list"
        onAction={() => router.push(ROUTES.PURCHASE.BILLS)}
      />
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
          <StockUpdateInfo
            bill={bill}
            onConfirm={
              bill.status === "PENDING"
                ? () => confirmMutation.mutate()
                : undefined
            }
            isConfirming={confirmMutation.isPending}
          />
          <PaymentStatusCard bill={bill} />
        </div>
      </div>

      <PaymentHistory bill={bill} />

      <ReturnBillDialog
        open={returnOpen}
        billNumber={bill.billNumber}
        isPending={returnMutation.isPending}
        onClose={() => {
          if (!returnMutation.isPending) setReturnOpen(false);
        }}
        onConfirm={(reason) => returnMutation.mutate(reason)}
      />
    </div>
  );
}
