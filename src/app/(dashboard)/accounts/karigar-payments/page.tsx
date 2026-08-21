"use client";

import { useEffect, useMemo, useState } from "react";
import {
  mockKarigarPayments,
  type MockKarigarPayment,
} from "@/mock/accounts";
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

const PAGE_SIZE = 10;

const defaultFilters: KarigarPaymentFilters = {
  karigarId: "ALL",
  poId: "ALL",
  status: "ALL",
  week: "42",
};

export default function KarigarPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] =
    useState<MockKarigarPayment[]>(mockKarigarPayments);
  const [filters, setFilters] =
    useState<KarigarPaymentFilters>(defaultFilters);
  const [applied, setApplied] =
    useState<KarigarPaymentFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [recordTarget, setRecordTarget] =
    useState<MockKarigarPayment | null>(null);
  const [receiptTarget, setReceiptTarget] =
    useState<MockKarigarPayment | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (
        applied.karigarId !== "ALL" &&
        payment.karigarId !== applied.karigarId
      ) {
        return false;
      }
      if (applied.poId !== "ALL" && payment.poId !== applied.poId) return false;
      if (applied.status !== "ALL" && payment.status !== applied.status) {
        return false;
      }
      if (
        applied.week !== "ALL" &&
        String(payment.weekNumber) !== applied.week
      ) {
        return false;
      }
      return true;
    });
  }, [payments, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pending = payments.filter((p) => p.status === "PENDING");
  const totalDueThisWeek = pending
    .filter((p) => p.weekNumber === 42)
    .reduce((sum, p) => sum + p.amountDue, 0);
  const totalPaidThisMonth = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountDue, 0);

  return (
    <div>
      <PageHeader
        title="Karigar Payments"
        subtitle="Payments auto-calculated from production entries. Rates are locked - no manual override possible."
      />

      <KarigarPaymentNotice />

      <KarigarPaymentStatCards
        totalDueThisWeek={totalDueThisWeek || 12480}
        totalPaidThisMonth={totalPaidThisMonth || 48920}
        pendingCount={pending.length || 6}
      />

      <KarigarPaymentFilterBar
        filters={filters}
        onChange={setFilters}
        onApply={() => {
          setApplied(filters);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          <KarigarPaymentsTable
            payments={pageItems}
            onRecordPayment={setRecordTarget}
            onViewReceipt={setReceiptTarget}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="payment records"
          />
        </>
      )}

      <RecordKarigarPaymentDrawer
        open={Boolean(recordTarget)}
        payment={recordTarget}
        onClose={() => setRecordTarget(null)}
        onConfirm={(values) => {
          if (!recordTarget) return;
          setPayments((prev) =>
            prev.map((item) =>
              item.id === recordTarget.id
                ? {
                    ...item,
                    status: "PAID",
                    paidAt: values.paymentDate,
                    paymentMode: values.paymentMode,
                    referenceNo: values.referenceNo ?? "",
                    notes: values.notes,
                  }
                : item
            )
          );
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
