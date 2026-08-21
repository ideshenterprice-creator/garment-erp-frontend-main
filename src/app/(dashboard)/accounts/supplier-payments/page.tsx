"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  mockSupplierPayments,
  type MockSupplierPayment,
} from "@/mock/accounts";
import { PageHeader, PageHeaderAction } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingSpinner";
import { Pagination } from "@/components/common/Pagination";
import {
  SupplierPaymentFilterBar,
  type SupplierPaymentFilters,
} from "@/components/modules/accounts/SupplierPaymentFilterBar";
import { SupplierPaymentStatCards } from "@/components/modules/accounts/SupplierPaymentStatCards";
import { SupplierPaymentsTable } from "@/components/modules/accounts/SupplierPaymentsTable";
import { RecordSupplierPaymentDrawer } from "@/components/modules/accounts/RecordSupplierPaymentDrawer";

const PAGE_SIZE = 10;

const defaultFilters: SupplierPaymentFilters = {
  supplierId: "ALL",
  status: "ALL",
};

export default function SupplierPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] =
    useState<MockSupplierPayment[]>(mockSupplierPayments);
  const [filters, setFilters] =
    useState<SupplierPaymentFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [payTarget, setPayTarget] = useState<MockSupplierPayment | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return payments.filter((row) => {
      if (filters.supplierId !== "ALL" && row.supplierId !== filters.supplierId) {
        return false;
      }
      if (filters.status !== "ALL" && row.status !== filters.status) return false;
      return true;
    });
  }, [payments, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpis = useMemo(() => {
    const totalPending = payments.reduce((sum, row) => sum + row.balanceDue, 0);
    const totalPaidThisMonth = payments
      .filter((row) => row.amountPaid > 0)
      .reduce((sum, row) => sum + row.amountPaid, 0);
    return { totalPending, totalPaidThisMonth };
  }, [payments]);

  return (
    <div>
      <PageHeader
        title="Supplier Payments"
        subtitle="Pay suppliers against confirmed purchase bills."
        actionButton={
          <PageHeaderAction
            label="New Payment"
            icon={<Plus className="size-4" />}
            onClick={() => {
              const unpaid = payments.find((p) => p.status !== "PAID");
              if (unpaid) setPayTarget(unpaid);
              else toast.message("No unpaid bills available");
            }}
          />
        }
      />

      <SupplierPaymentStatCards
        totalPending={kpis.totalPending}
        totalPaidThisMonth={kpis.totalPaidThisMonth}
      />

      <SupplierPaymentFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          <SupplierPaymentsTable
            payments={pageItems}
            onPay={setPayTarget}
            onRowClick={(row) => {
              if (row.status !== "PAID") {
                setPayTarget(row);
                return;
              }
              toast.message(`${row.billNo} is fully paid`);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            label="entries"
          />
        </>
      )}

      <RecordSupplierPaymentDrawer
        open={Boolean(payTarget)}
        payment={payTarget}
        onClose={() => setPayTarget(null)}
        onConfirm={(values) => {
          if (!payTarget) return;
          setPayments((prev) =>
            prev.map((row) => {
              if (row.id !== payTarget.id) return row;
              const amountPaid = row.amountPaid + values.amountPaid;
              const balanceDue = Math.max(0, row.billAmount - amountPaid);
              const status =
                balanceDue === 0
                  ? "PAID"
                  : amountPaid > 0
                    ? "PARTIAL"
                    : "UNPAID";
              return {
                ...row,
                amountPaid,
                balanceDue,
                status,
                payments: [
                  ...row.payments,
                  {
                    id: `spp-${Date.now()}`,
                    date: values.paymentDate,
                    mode: values.paymentMode,
                    referenceNo: values.referenceNo ?? "",
                    amount: values.amountPaid,
                    notes: values.notes,
                  },
                ],
              };
            })
          );
          toast.success("Payment recorded successfully.");
        }}
      />
    </div>
  );
}
