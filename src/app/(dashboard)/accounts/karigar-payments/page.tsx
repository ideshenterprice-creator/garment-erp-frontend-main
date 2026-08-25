"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { KarigarPayment } from "@/types";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  KarigarPaymentFilterBar,
  type KarigarPaymentFilters,
} from "@/components/modules/accounts/KarigarPaymentFilterBar";
import { KarigarPaymentNotice } from "@/components/modules/accounts/KarigarPaymentNotice";
import { KarigarPaymentStatCards } from "@/components/modules/accounts/KarigarPaymentStatCards";
import { KarigarPaymentsTable } from "@/components/modules/accounts/KarigarPaymentsTable";
import { RecordKarigarPaymentDrawer } from "@/components/modules/accounts/RecordKarigarPaymentDrawer";
import { ViewReceiptDrawer } from "@/components/modules/accounts/ViewReceiptDrawer";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toIsoDate } from "@/lib/accounts";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatCurrency } from "@/lib/utils";
import {
  confirmKarigarPayment,
  getKarigarPayments,
} from "@/services/accounts.service";

const PAGE_SIZE = 10;

const defaultFilters: KarigarPaymentFilters = {
  karigarId: "ALL",
  poId: "ALL",
  status: "ALL",
  week: "ALL",
};

export default function KarigarPaymentsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] =
    useState<KarigarPaymentFilters>(defaultFilters);
  const [applied, setApplied] =
    useState<KarigarPaymentFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [recordTarget, setRecordTarget] = useState<KarigarPayment | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<KarigarPayment | null>(
    null
  );

  const weekParts =
    applied.week !== "ALL" ? applied.week.split("-") : null;
  const weekNumber = weekParts ? Number(weekParts[1]) : undefined;
  const year = weekParts ? Number(weekParts[0]) : undefined;

  const queryFilters = {
    karigarId: applied.karigarId === "ALL" ? undefined : applied.karigarId,
    poId: applied.poId === "ALL" ? undefined : applied.poId,
    status: applied.status === "ALL" ? undefined : applied.status,
    weekNumber,
    year,
    page,
    limit: PAGE_SIZE,
  };

  const paymentsQuery = useQuery({
    queryKey: [...QUERY_KEYS.KARIGAR_PAYMENTS, queryFilters],
    queryFn: () => getKarigarPayments(queryFilters),
  });

  const confirmMutation = useMutation({
    mutationFn: ({
      id,
      paymentDate,
      paymentMode,
      referenceNo,
    }: {
      id: string;
      paymentDate: string;
      paymentMode: string;
      referenceNo?: string;
    }) =>
      confirmKarigarPayment(id, {
        paymentDate: toIsoDate(paymentDate),
        paymentMode,
        referenceNo: referenceNo || undefined,
      }),
    onSuccess: () => {
      const amount = recordTarget
        ? formatCurrency(Number(recordTarget.amountDue))
        : "";
      const name = recordTarget?.karigar.name ?? "karigar";
      toast.success(`Payment of ${amount} confirmed for ${name}.`);
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.KARIGAR_PAYMENTS,
      });
      setRecordTarget(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to confirm payment."));
    },
  });

  const payments = paymentsQuery.data?.data.data ?? [];
  const total = paymentsQuery.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const summary = paymentsQuery.data?.data.summary;
  const pendingCount =
    summary?.pendingCount ??
    payments.filter((row) => row.status === "PENDING").length;

  return (
    <div>
      <PageHeader
        title="Karigar Payments"
        subtitle="Payments auto-calculated from production entries. Rates are locked - no manual override possible."
      />

      <KarigarPaymentNotice />

      <KarigarPaymentStatCards
        totalDueThisWeek={summary?.totalDueThisWeek ?? 0}
        totalPaidThisMonth={summary?.totalPaidThisMonth ?? 0}
        pendingCount={pendingCount}
      />

      <KarigarPaymentFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      {paymentsQuery.isLoading ? (
        <TableSkeleton rows={8} />
      ) : paymentsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">Failed to load karigar payments.</p>
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
          <KarigarPaymentsTable
            payments={payments}
            onRecordPayment={setRecordTarget}
            onViewReceipt={setReceiptTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="payment records"
          />
        </>
      )}

      <RecordKarigarPaymentDrawer
        open={Boolean(recordTarget)}
        payment={recordTarget}
        isSubmitting={confirmMutation.isPending}
        onClose={() => setRecordTarget(null)}
        onConfirm={(values) => {
          if (!recordTarget) return;
          confirmMutation.mutate({
            id: recordTarget.id,
            paymentDate: values.paymentDate,
            paymentMode: values.paymentMode,
            referenceNo: values.referenceNo,
          });
        }}
      />

      <ViewReceiptDrawer
        open={Boolean(receiptTarget)}
        payment={receiptTarget}
        onClose={() => setReceiptTarget(null)}
      />
    </div>
  );
}
