"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import type { SupplierBillPaymentRow } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  SupplierPaymentFilterBar,
  type SupplierPaymentFilters,
} from "@/components/modules/accounts/SupplierPaymentFilterBar";
import { SupplierPaymentStatCards } from "@/components/modules/accounts/SupplierPaymentStatCards";
import { SupplierPaymentsTable } from "@/components/modules/accounts/SupplierPaymentsTable";
import { RecordSupplierPaymentDrawer } from "@/components/modules/accounts/RecordSupplierPaymentDrawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ACCOUNT_PAYMENT_MODES, toIsoDate } from "@/lib/accounts";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";
import {
  getSupplierPayments,
  recordSupplierPayment,
} from "@/services/accounts.service";

const PAGE_SIZE = 10;

const defaultFilters: SupplierPaymentFilters = {
  supplierId: "ALL",
  status: "ALL",
  from: "",
  to: "",
};

function modeLabel(mode: string): string {
  return (
    ACCOUNT_PAYMENT_MODES.find((item) => item.value === mode)?.label ?? mode
  );
}

export default function SupplierPaymentsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] =
    useState<SupplierPaymentFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [payTarget, setPayTarget] = useState<SupplierBillPaymentRow | null>(
    null
  );
  const [viewTarget, setViewTarget] = useState<SupplierBillPaymentRow | null>(
    null
  );

  const queryFilters = {
    supplierId: filters.supplierId === "ALL" ? undefined : filters.supplierId,
    status: filters.status === "ALL" ? undefined : filters.status,
    from: filters.from ? toIsoDate(filters.from) : undefined,
    to: filters.to ? toIsoDate(filters.to) : undefined,
    page,
    limit: PAGE_SIZE,
  };

  const paymentsQuery = useQuery({
    queryKey: [...QUERY_KEYS.SUPPLIER_PAYMENTS, queryFilters],
    queryFn: () => getSupplierPayments(queryFilters),
  });

  const recordMutation = useMutation({
    mutationFn: recordSupplierPayment,
    onSuccess: () => {
      toast.success("Payment recorded.");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.SUPPLIER_PAYMENTS,
      });
      setPayTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record payment."));
    },
  });

  const payments = paymentsQuery.data?.data.data ?? [];
  const total = paymentsQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = paymentsQuery.data?.data.summary;

  return (
    <div>
      <PageHeader
        title="Supplier Payments"
        subtitle="Pay suppliers against confirmed purchase bills."
      />

      <SupplierPaymentStatCards
        totalPending={summary?.totalPending ?? 0}
        totalPaidThisMonth={summary?.totalPaidThisMonth ?? 0}
      />

      <SupplierPaymentFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {paymentsQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : paymentsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            Failed to load supplier payments.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => void paymentsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <SupplierPaymentsTable
            payments={payments}
            onPay={setPayTarget}
            onView={setViewTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="entries"
          />
        </>
      )}

      <RecordSupplierPaymentDrawer
        open={Boolean(payTarget)}
        payment={payTarget}
        isSubmitting={recordMutation.isPending}
        onClose={() => setPayTarget(null)}
        onConfirm={(values) => {
          if (!payTarget) return;
          recordMutation.mutate({
            purchaseBillId: payTarget.id,
            amountPaid: values.amountPaid,
            paymentDate: toIsoDate(values.paymentDate),
            paymentMode: values.paymentMode,
            referenceNo: values.referenceNo || undefined,
            notes: values.notes || undefined,
          });
        }}
      />

      <Dialog
        open={Boolean(viewTarget)}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewTarget?.billNumber}</DialogTitle>
          </DialogHeader>
          {viewTarget ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Supplier</span>
                <span className="font-medium">
                  {viewTarget.supplier?.name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Bill Amount</span>
                <span className="font-medium">
                  {formatCurrency(Number(viewTarget.totalAmount))}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium">
                  {formatCurrency(Number(viewTarget.totalPaid))}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">
                  {formatCurrency(Number(viewTarget.outstanding))}
                </span>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 font-semibold">Payment History</p>
                {(viewTarget.payments ?? []).length === 0 ? (
                  <p className="text-muted-foreground">No payments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {(viewTarget.payments ?? []).map((payment) => (
                      <li
                        key={payment.id}
                        className="rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <div className="flex justify-between gap-2">
                          <span>
                            {format(
                              new Date(payment.paymentDate),
                              "dd MMM yyyy"
                            )}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(Number(payment.amountPaid))}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {modeLabel(payment.paymentMode)}
                          {payment.referenceNo
                            ? ` · ${payment.referenceNo}`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
